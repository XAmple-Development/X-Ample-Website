import "server-only";
import { supabaseAdmin } from "@/lib/supabase";

export type SystemStateRow = {
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
};

export async function getSystemState(key: string): Promise<SystemStateRow | null> {
  const k = String(key).trim();
  if (!k) return null;

  const sb = supabaseAdmin();
  const { data } = await sb.from("system_state").select("key, value, updated_at").eq("key", k).maybeSingle();
  if (!data) return null;

  return {
    key: data.key as string,
    value: (data.value ?? {}) as Record<string, unknown>,
    updated_at: data.updated_at as string,
  };
}

export async function setSystemState(key: string, value: Record<string, unknown>) {
  const k = String(key).trim();
  if (!k) return;

  const sb = supabaseAdmin();
  const now = new Date().toISOString();
  await sb.from("system_state").upsert(
    {
      key: k,
      value: value ?? {},
      updated_at: now,
    },
    { onConflict: "key" },
  );
}

