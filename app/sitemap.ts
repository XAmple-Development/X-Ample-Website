import type { MetadataRoute } from "next";
import { listBlogPosts } from "@/lib/blog";
import { listPackageDocMetas } from "@/lib/docs";

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
    { url: `${base}/store`, lastModified: now },
    { url: `${base}/docs`, lastModified: now },
    { url: `${base}/vacancies`, lastModified: now },
  ];

  const blog = await listBlogPosts().catch(() => []);
  const blogRoutes: MetadataRoute.Sitemap = blog.map((p) => ({
    url: `${base}/blog/${encodeURIComponent(p.slug)}`,
    lastModified: safeDate(p.date),
  }));

  const docs = await listPackageDocMetas().catch(() => []);
  const docRoutes: MetadataRoute.Sitemap = docs
    .filter((d) => d.id)
    .map((d) => ({
      url: `${base}/docs/package/${encodeURIComponent(d.id)}`,
      lastModified: safeDate(d.updated),
    }));

  return [...staticRoutes, ...blogRoutes, ...docRoutes];
}

