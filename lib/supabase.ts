import "server-only";

import { createClient } from "@supabase/supabase-js";

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export type SupabaseDb = ReturnType<typeof supabaseAdmin>;

/**
 * Server-only Supabase client using the Service Role key.
 * - Use ONLY in server components / route handlers.
 * - Never expose this key to the browser.
 */
export function supabaseAdmin() {
  const url = mustEnv("SUPABASE_URL");
  const key = mustEnv("SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

