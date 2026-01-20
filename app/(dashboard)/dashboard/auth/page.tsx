import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { tebexAccountToken, tebexFetch } from "@/lib/tebex";
import { extractTebexIdentity } from "@/lib/tebexIdentity";
import { SESSION_COOKIE_NAME, signSession, isAdminForCustomerId } from "@/lib/auth";

export const runtime = "nodejs";

export default async function DashboardAuthPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const ident = typeof sp.ident === "string" ? sp.ident.trim() : "";

  if (!ident) {
    redirect("/store?error=missing_ident");
  }

  // Verify the login by pulling the basket and extracting a stable identity.
  const token = tebexAccountToken();
  const basket = await tebexFetch<any>(
    `/accounts/${encodeURIComponent(token)}/baskets/${encodeURIComponent(ident)}`,
    { method: "GET" },
  );

  const identity = extractTebexIdentity(basket);
  if (!identity) {
    redirect("/store?error=identity_missing");
  }

  // Upsert user in Supabase keyed by tebex_customer_id.
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
    .select("id, tebex_customer_id")
    .maybeSingle();

  if (upsertRes.error || !upsertRes.data?.id) {
    redirect("/store?error=user_upsert_failed");
  }

  const isAdmin = isAdminForCustomerId(identity.tebexCustomerId);
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

  // Store admin hint as non-sensitive query? Not needed; admin is checked server-side.
  void isAdmin;

  redirect("/dashboard");
}

