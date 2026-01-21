import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { setSystemState } from "@/lib/systemState";

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

  const normalized = String(incomingSig)
    .trim()
    .toLowerCase()
    .replace(/^sha256=/, "");

  // Variant A (per docs): HMAC(secret, SHA256(raw_body_bytes) [raw digest bytes])
  const bodyHash = crypto.createHash("sha256").update(rawBody).digest(); // Buffer
  const expectedA = crypto.createHmac("sha256", secret).update(bodyHash).digest("hex");

  // Variant B (seen in the wild): HMAC(secret, SHA256(raw_body_bytes) as hex string)
  const bodyHashHex = crypto.createHash("sha256").update(rawBody).digest("hex");
  const expectedB = crypto.createHmac("sha256", secret).update(bodyHashHex).digest("hex");

  const ok = timingSafeEqHex(normalized, expectedA) || timingSafeEqHex(normalized, expectedB);
  if (!ok) throw new Error("Invalid signature");
}

function timingSafeEqHex(a: string, b: string) {
  const aa = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

export async function GET() {
  // Tebex \"Validate\" may probe endpoints; respond 200.
  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function POST(req: Request) {
  const sig = header(req, "x-signature");
  if (!sig) {
    return NextResponse.json(
      {
        error: "Missing X-Signature",
        hint: "Tebex validation should include X-Signature. If it doesn't, check you're using the Tebex Webhooks feature (not Login Webhooks) and that the endpoint type matches.",
      },
      { status: 401 },
    );
  }

  const raw = Buffer.from(await req.arrayBuffer());

  try {
    verifyTebexSignatureOrThrow(raw, sig);
  } catch {
    return NextResponse.json(
      {
        error: "Invalid signature",
        hint: "Most commonly: TEBEX_WEBHOOK_SECRET is missing on the deployed environment, or it doesn't match the Secret Key shown in Tebex for this endpoint.",
      },
      { status: 401 },
    );
  }

  // Mark webhook as alive (even if this is a validate/ping payload).
  await setSystemState("tebex_webhook", { lastSeenAt: new Date().toISOString() });

  if (!raw.length) {
    // If Tebex validates with an empty body, accept after signature verification.
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const text = raw.toString("utf8");
  const payload = safeJsonParse(text);
  if (!payload) {
    // Validation/ping payloads should not fail the endpoint; accept after signature verification.
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const tebexCustomerId = extractWebhookCustomerId(payload);
  const tebexPaymentId = extractWebhookPaymentId(payload);
  if (!tebexCustomerId || !tebexPaymentId) {
    // Tebex validation/ping events may not include purchase identifiers.
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const { total, currency } = extractWebhookMoney(payload);
  const items = extractWebhookItems(payload);

  const sb = supabaseAdmin();
  const now = new Date().toISOString();

  await setSystemState("tebex_webhook", {
    lastSeenAt: now,
    lastPurchaseAt: now,
    lastPaymentId: tebexPaymentId,
    lastCustomerId: tebexCustomerId,
  });

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

