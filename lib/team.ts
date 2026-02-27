import "server-only";

export type TeamMemberRow = {
  id: string;
  name: string;
  role: string | null;
  bio: string | null;
  avatar_url: string | null;
  discord_url: string | null;
  github_url: string | null;
  twitter_url: string | null;
  sort_order: number;
  updated_at: string;
};

export function safeTrim(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export function normalizeUrl(v: unknown): string | null {
  const s = safeTrim(v);
  if (!s) return null;
  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

export function normalizeSortOrder(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return Math.round(v);
  const s = safeTrim(v);
  if (s === "") return 0;
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n) : 0;
}
