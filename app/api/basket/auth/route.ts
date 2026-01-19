import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { tebexAccountToken, tebexFetch } from "@/lib/tebex";

export const runtime = "nodejs";

function getOrigin(req: NextRequest) {
  // Netlify/Vercel proxies
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host =
    req.headers.get("x-forwarded-host") ??
    req.headers.get("host");

  if (!host) return null;
  return `${proto}://${host}`;
}

function isSameOrigin(urlStr: string, origin: string) {
  try {
    const u = new URL(urlStr);
    const o = new URL(origin);
    return u.protocol === o.protocol && u.host === o.host;
  } catch {
    return false;
  }
}

/**
 * GET /api/basket/auth?ident=...&returnUrl=...
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const ident = url.searchParams.get("ident")?.trim();
  if (!ident) return NextResponse.json({ error: "Missing ident" }, { status: 400 });

  const origin = getOrigin(req);
  if (!origin) return NextResponse.json({ error: "Unable to determine origin" }, { status: 400 });

  // Default return back to your store page on the SAME domain that served this request
  const returnUrl = url.searchParams.get("returnUrl")?.trim() ?? `${origin}/store`;

  // Prevent open redirects
  if (!isSameOrigin(returnUrl, origin)) {
    return NextResponse.json({ error: "returnUrl must be same-origin" }, { status: 400 });
  }

  const token = tebexAccountToken();

  const data = await tebexFetch<unknown>(
    `/accounts/${encodeURIComponent(token)}/baskets/${encodeURIComponent(ident)}/auth?returnUrl=${encodeURIComponent(returnUrl)}`,
    { method: "GET" },
  );

  return NextResponse.json(data, { status: 200 });
}
