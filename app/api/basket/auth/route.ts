import { NextResponse } from "next/server";
import { siteUrl, tebexAccountToken, tebexFetch } from "@/lib/tebex";

export const runtime = "nodejs";

function isSameOrigin(urlStr: string, origin: string) {
  try {
    const u = new URL(urlStr);
    const o = new URL(origin);
    return u.protocol === o.protocol && u.host === o.host;
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const ident = url.searchParams.get("ident")?.trim();
  if (!ident) return NextResponse.json({ error: "Missing ident" }, { status: 400 });

  const origin = siteUrl();
  const returnUrl = url.searchParams.get("returnUrl")?.trim() || `${origin}/store`;

  if (!isSameOrigin(returnUrl, origin)) {
    return NextResponse.json({ error: "returnUrl must be same-origin" }, { status: 400 });
  }

  const token = tebexAccountToken();
  const data = await tebexFetch<unknown>(
    `/accounts/${encodeURIComponent(token)}/baskets/${encodeURIComponent(ident)}/auth?returnUrl=${encodeURIComponent(returnUrl)}`,
    { method: "GET" },
  );

  return NextResponse.json(data);
}
