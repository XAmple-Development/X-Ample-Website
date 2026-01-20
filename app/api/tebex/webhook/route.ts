import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function header(req: Request, name: string) {
  return req.headers.get(name) ?? req.headers.get(name.toLowerCase());
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function asIdString(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "string") {
    const s = v.trim();
    return s ? s : null;
  }
  if (typeof v === "number" && Number.isFinite(v)) return String(Math.trunc(v));
  return null;
}

function asNumber(v: unknown): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
}

function pickFirst(obj: any, paths: string[]): unknown {
  for (const p of paths) {
    const parts = p.split(".");
    let cur: any = obj;
    let ok = true;
    for (const part of parts) {
      if (!cur || typeof cur !== "object" || !(part in cur)) {
        ok = false;
        break;
      }
      cur = cur[part];
    }
    if (ok) return cur;
  }
  return undefined;
}

function extractWebhookCustomerId(payload: any): string | null {
  const v = pickFirst(payload, [
    "customer.id",
    "customer.customer_id",
    "customerId",
    "customer_id",
    "data.customer.id",
    "data.customer.customer_id",
  ]);
  return asIdString(v);
}

function extractWebhookPaymentId(payload: any): string | null {
  const v = pickFirst(payload, [
    "payment.id",
    "payment.payment_id",
    "paymentId",
    "payment_id",
    "transaction.id",
    "transaction.transaction_id",
    "transactionId",
    "transaction_id",
    "data.payment.id",
  ]);
  return asIdString(v);
}

function extractWebhookMoney(payload: any): { total: number | null; currency: string | null } {
  const currency =
    (pickFirst(payload, ["currency", "payment.currency", "payment.currency_code", "data.currency"]) as any) ?? null;
  const currencyStr = typeof currency === "string" && currency.trim() ? currency.trim().toUpperCase() : null;

  const totalRaw =
    pickFirst(payload, [
      "total",
      "amount",
      "payment.amount",
      "payment.total",
      "payment.total_amount",
      "data.total",
      "data.amount",
    ]) ?? null;

  return { total: asNumber(totalRaw), currency: currencyStr };
}

function extractWebhookItems(payload: any): Array<{ packageId?: string; name?: string; quantity?: number; price?: number; currency?: string }> {
  const items =
    pickFirst(payload, [
      "packages",
      "items",
      "products",
      "payment.items",
      "data.packages",
      "data.items",
    ]) ?? [];

  if (!Array.isArray(items)) return [];

  return items.map((it: any) => {
    const packageId = asIdString(it?.id ?? it?.package_id ?? it?.packageId ?? it?.product_id ?? it?.productId) ?? undefined;
    const name = typeof it?.name === "string" ? it.name : typeof it?.title === "string" ? it.title : undefined;
    const quantity = asNumber(it?.quantity ?? it?.qty) ?? undefined;
    const price = asNumber(it?.price ?? it?.amount) ?? undefined;
    const currency =
      typeof it?.currency === "string" && it.currency.trim() ? it.currency.trim().toUpperCase() : undefined;
    return { packageId, name, quantity: quantity != null ? Math.max(1, Math.trunc(quantity)) : undefined, price, currency };
  });
}

function verifyTebexSignatureOrThrow(rawBody: Buffer, incomingSig: string) {
  const secret = mustEnv("TEBEX_WEBHOOK_SECRET");

  // Tebex spec: signature = HMAC_SHA256(secret, SHA256(raw_body_bytes))
  // Where the inner SHA256 is the *raw digest bytes*, not the hex string.
  const bodyHash = crypto.createHash("sha256").update(rawBody).digest(); // Buffer
  const expectedHex = crypto.createHmac("sha256", secret).update(bodyHash).digest("hex");

  const a = Buffer.from(expectedHex, "utf8");
  const b = Buffer.from(String(incomingSig).trim().toLowerCase(), "utf8");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new Error("Invalid signature");
  }
}

export async function POST(req: Request) {
  const sig = header(req, "x-signature");
  if (!sig) return NextResponse.json({ error: "Missing X-Signature" }, { status: 401 });

  const raw = Buffer.from(await req.arrayBuffer());

  try {
    verifyTebexSignatureOrThrow(raw, sig);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const text = raw.toString("utf8");
  const payload = safeJsonParse(text);
  if (!payload) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const tebexCustomerId = extractWebhookCustomerId(payload);
  const tebexPaymentId = extractWebhookPaymentId(payload);
  if (!tebexCustomerId || !tebexPaymentId) {
    return NextResponse.json({ error: "Missing customer/payment id" }, { status: 400 });
  }

  const { total, currency } = extractWebhookMoney(payload);
  const items = extractWebhookItems(payload);

  const sb = supabaseAdmin();
  const now = new Date().toISOString();

  // Upsert user (webhook might arrive before the user ever logs in on-site).
  const userUpsert = await sb
    .from("users")
    .upsert(
      {
        tebex_customer_id: tebexCustomerId,
        updated_at: now,
      },
      { onConflict: "tebex_customer_id" },
    )
    .select("id")
    .maybeSingle();

  if (userUpsert.error || !userUpsert.data?.id) {
    return NextResponse.json({ error: "User upsert failed" }, { status: 500 });
  }

  const purchaseUpsert = await sb
    .from("purchases")
    .upsert(
      {
        user_id: userUpsert.data.id,
        tebex_payment_id: tebexPaymentId,
        total,
        currency,
        raw_json: payload,
      },
      { onConflict: "tebex_payment_id" },
    )
    .select("id")
    .maybeSingle();

  if (purchaseUpsert.error || !purchaseUpsert.data?.id) {
    return NextResponse.json({ error: "Purchase upsert failed" }, { status: 500 });
  }

  const purchaseId = purchaseUpsert.data.id;

  // Idempotent: replace item rows for this purchase.
  await sb.from("purchase_items").delete().eq("purchase_id", purchaseId);
  if (items.length) {
    const rows = items.map((it) => ({
      purchase_id: purchaseId,
      package_id: it.packageId ?? null,
      name: it.name ?? null,
      quantity: it.quantity ?? 1,
      price: it.price ?? null,
      currency: it.currency ?? currency ?? null,
    }));
    const ins = await sb.from("purchase_items").insert(rows);
    if (ins.error) {
      return NextResponse.json({ error: "Purchase items insert failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

