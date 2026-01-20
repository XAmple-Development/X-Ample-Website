import "server-only";

import type { SessionClaims } from "@/lib/auth";
import { isAdminForCustomerId } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Admin check:
 * - Primary: `users.is_admin` (toggle in Supabase dashboard)
 * - Fallback: `ADMIN_ALLOWLIST` env (so you can recover if DB flagging breaks)
 */
export async function isAdminForSession(session: SessionClaims): Promise<boolean> {
  if (isAdminForCustomerId(session.tebexCustomerId)) return true;

  const sb = supabaseAdmin();
  const { data, error } = await sb.from("users").select("is_admin").eq("id", session.userId).maybeSingle();
  if (error) return false;
  return Boolean((data as any)?.is_admin);
}

