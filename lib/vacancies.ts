import "server-only";

export type VacancyStatus = "open" | "closed" | "draft";

export type VacancyRow = {
  id: string;
  slug: string;
  title: string;
  location: string | null;
  type: string | null;
  salary: string | null;
  body_mdx: string;
  apply_url: string | null;
  apply_email: string | null;
  status: VacancyStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export function slugify(input: string) {
  const s = String(input || "")
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return s || "vacancy";
}

export function safeTrim(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

export function normalizeStatus(v: unknown): VacancyStatus {
  const s = safeTrim(v).toLowerCase();
  if (s === "open" || s === "closed" || s === "draft") return s;
  return "draft";
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

export function normalizeEmail(v: unknown): string | null {
  const s = safeTrim(v);
  if (!s) return null;
  // simple sanity check (avoid over-validating)
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s)) return null;
  return s;
}

export function normalizePublishedAt(v: unknown): string | null {
  const s = safeTrim(v);
  if (!s) return null;
  const d = new Date(s);
  return Number.isFinite(d.getTime()) ? d.toISOString() : null;
}

