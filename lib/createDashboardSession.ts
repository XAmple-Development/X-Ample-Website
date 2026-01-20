import "server-only";

import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";
import { tebexAccountToken, tebexFetch } from "@/lib/tebex";
import { extractTebexIdentity } from "@/lib/tebexIdentity";
import { SESSION_COOKIE_NAME, signSession } from "@/lib/auth";

/**
 * Given a Tebex basket ident, verify the basket is authenticated,
 * upsert the user, and set the HttpOnly session cookie.
 */
export async function createDashboardSessionFromBasketIdent(ident: string) {
  const trimmed = ident.trim();
  if (!trimmed) throw new Error("Missing ident");

  const token = tebexAccountToken();
  const basket = await tebexFetch<any>(
    `/accounts/${encodeURIComponent(token)}/baskets/${encodeURIComponent(trimmed)}`,
    { method: "GET" },
  );

  const identity = extractTebexIdentity(basket);
  if (!identity) throw new Error("Identity missing");

  const sb = supabaseAdmin();
  const now = new Date().toISOString();

  const upsertRes = await sb
    .from("users")
    .upsert(
      {
        tebex_customer_id: identity.tebexCustomerId,
        username: identity.username ?? null,
        email: identity.email ?? null,
        updated_at: now,
      },
      { onConflict: "tebex_customer_id" },
    )
    .select("id")
    .maybeSingle();

  if (upsertRes.error || !upsertRes.data?.id) throw new Error("User upsert failed");

  const jwt = await signSession({
    userId: upsertRes.data.id,
    tebexCustomerId: identity.tebexCustomerId,
    username: identity.username ?? null,
    email: identity.email ?? null,
  });

  const c = await cookies();
  c.set(SESSION_COOKIE_NAME, jwt, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return { userId: upsertRes.data.id, tebexCustomerId: identity.tebexCustomerId };
}

