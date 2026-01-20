import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { isAdminForSession } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase";
import { tebexPluginFetch } from "@/lib/tebexPlugin";

export const runtime = "nodejs";

function asIdString(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "string") {
    const s = v.trim();
    return s ? s : null;
  }
  if (typeof v === "number" && Number.isFinite(v)) return String(Math.trunc(v));
  return null;
}

function extractArray<T>(payload: any): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as T[];
  if (Array.isArray(payload?.data)) return payload.data as T[];
  if (Array.isArray(payload?.payments)) return payload.payments as T[];
  if (Array.isArray(payload?.data?.payments)) return payload.data.payments as T[];
  return [];
}

function pickUsername(p: any): string | null {
  const candidates = [p?.player?.name, p?.player?.username, p?.username, p?.ign, p?.user, p?.customer?.name];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim();
  }
  return null;
}

function pickCurrency(p: any): string | null {
  const candidates = [p?.currency, p?.payment_currency, p?.currency_code];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim().toUpperCase();
  }
  return null;
}

function asNumber(v: unknown): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await isAdminForSession(session))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    // Plugin API payments listing (up to 100)
    const raw = await tebexPluginFetch<any>("/payments");
    const payments = extractArray<any>(raw);

    const sb = supabaseAdmin();
    let upserted = 0;

    for (const pay of payments) {
      const paymentId =
        asIdString(pay?.transaction_id) ??
        asIdString(pay?.transaction) ??
        asIdString(pay?.id) ??
        asIdString(pay?.payment_id);
      if (!paymentId) continue;

      const username = pickUsername(pay);
      const tebexCustomerId = username ? `username:${username.toLowerCase()}` : `payment:${paymentId}`;

      const userUpsert = await sb
        .from("users")
        .upsert(
          { tebex_customer_id: tebexCustomerId, username: username ?? null, updated_at: new Date().toISOString() },
          { onConflict: "tebex_customer_id" },
        )
        .select("id")
        .maybeSingle();

      if (userUpsert.error || !userUpsert.data?.id) continue;

      const currency = pickCurrency(pay);
      const total =
        asNumber(pay?.price) ??
        asNumber(pay?.amount) ??
        asNumber(pay?.total) ??
        asNumber(pay?.payment?.amount) ??
        null;

      const purchaseUpsert = await sb
        .from("purchases")
        .upsert(
          {
            user_id: userUpsert.data.id,
            tebex_payment_id: paymentId,
            total,
            currency,
            raw_json: pay,
          },
          { onConflict: "tebex_payment_id" },
        )
        .select("id")
        .maybeSingle();

      if (purchaseUpsert.error || !purchaseUpsert.data?.id) continue;

      const purchaseId = purchaseUpsert.data.id;

      // Replace items for idempotency
      await sb.from("purchase_items").delete().eq("purchase_id", purchaseId);

      const items = Array.isArray(pay?.packages) ? pay.packages : Array.isArray(pay?.items) ? pay.items : [];
      if (Array.isArray(items) && items.length) {
        const rows = items.map((it: any) => ({
          purchase_id: purchaseId,
          package_id: asIdString(it?.id ?? it?.package_id ?? it?.packageId),
          name: typeof it?.name === "string" ? it.name : null,
          quantity: Math.max(1, Math.trunc(asNumber(it?.quantity ?? it?.qty) ?? 1)),
          price: asNumber(it?.price ?? it?.amount),
          currency: typeof it?.currency === "string" ? it.currency.toUpperCase() : currency,
        }));
        await sb.from("purchase_items").insert(rows);
      }

      upserted += 1;
    }

    return NextResponse.redirect(new URL(`/dashboard/admin?synced=${upserted}`, req.url), 303);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Sync failed";
    return NextResponse.redirect(new URL(`/dashboard/admin?error=${encodeURIComponent(msg)}`, req.url), 303);
  }
}

