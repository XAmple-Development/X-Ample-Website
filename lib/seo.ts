/**
 * Base URL for the site (no trailing slash). Used for canonical URLs and JSON-LD.
 */
export function siteBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://x-ampledevelopment.co.uk"
  ).replace(/\/+$/, "");
}

/** Build absolute canonical URL for a path (e.g. "/about" -> "https://.../about"). */
export function canonicalUrl(path: string): string {
  const base = siteBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
