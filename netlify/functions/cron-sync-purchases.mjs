/**
 * Scheduled purchase sync (Tebex Plugin API -> Supabase).
 *
 * This runs on a cron schedule configured in netlify.toml.
 * It calls the site endpoint so the logic lives in Next.js and stays shared.
 *
 * Required env vars:
 * - SITE_URL (or NEXT_PUBLIC_SITE_URL)
 * - CRON_SYNC_SECRET
 */
export const handler = async () => {
  try {
    const base =
      (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://x-ampledevelopment.co.uk").replace(/\/+$/, "");
    const secret = process.env.CRON_SYNC_SECRET || "";
    if (!secret) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
        body: "Missing env var: CRON_SYNC_SECRET",
      };
    }

    const res = await fetch(`${base}/api/cron/sync-purchases`, {
      method: "POST",
      headers: { "x-cron-secret": secret },
    });

    const text = await res.text().catch(() => "");
    return {
      statusCode: res.ok ? 200 : res.status,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: text || (res.ok ? "ok" : "error"),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: `cron sync error: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
};

