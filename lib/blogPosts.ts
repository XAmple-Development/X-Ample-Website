import "server-only";

export type BlogPostStatus = "draft" | "published";

export type BlogPostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body_mdx: string;
  status: BlogPostStatus;
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
  return s || "post";
}

export function safeTrim(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

export function normalizeBlogStatus(v: unknown): BlogPostStatus {
  const s = safeTrim(v).toLowerCase();
  if (s === "published") return "published";
  return "draft";
}

export function normalizePublishedAt(v: unknown): string | null {
  const s = safeTrim(v);
  if (!s) return null;
  const d = new Date(s);
  return Number.isFinite(d.getTime()) ? d.toISOString() : null;
}
