import type { MetadataRoute } from "next";
import { listBlogPosts } from "@/lib/blog";
import { supabaseAdmin } from "@/lib/supabase";

function siteBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://x-ampledevelopment.co.uk"
  ).replace(/\/+$/, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteBaseUrl();
  const now = new Date();
  const safeDate = (v: string | undefined): Date => {
    if (!v) return now;
    const d = new Date(v);
    return Number.isFinite(d.getTime()) ? d : now;
  };

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now },
    { url: `${base}/about`, lastModified: now },
    { url: `${base}/team`, lastModified: now },
    { url: `${base}/services`, lastModified: now },
    { url: `${base}/portfolio`, lastModified: now },
    { url: `${base}/blog`, lastModified: now },
    { url: `${base}/contact`, lastModified: now },
    { url: `${base}/support`, lastModified: now },
    { url: `${base}/vacancies`, lastModified: now },
    { url: `${base}/privacy`, lastModified: now },
    { url: `${base}/terms`, lastModified: now },
  ];

  const blog = await listBlogPosts().catch(() => []);
  const blogRoutes: MetadataRoute.Sitemap = blog.map((p) => ({
    url: `${base}/blog/${encodeURIComponent(p.slug)}`,
    lastModified: safeDate(p.date),
  }));

  let vacancyRoutes: MetadataRoute.Sitemap = [];
  try {
    const sb = supabaseAdmin();
    const ts = new Date().toISOString();
    const { data } = await sb
      .from("vacancies")
      .select("slug, updated_at, published_at")
      .neq("status", "draft")
      .not("published_at", "is", null)
      .lte("published_at", ts)
      .limit(200);
    vacancyRoutes = (data ?? []).map((v) => ({
      url: `${base}/vacancies/${encodeURIComponent(v.slug)}`,
      lastModified: safeDate(v.updated_at ?? v.published_at ?? undefined),
    }));
  } catch {
    // Supabase not configured
  }

  return [...staticRoutes, ...blogRoutes, ...vacancyRoutes];
}
