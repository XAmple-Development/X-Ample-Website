import { NextResponse } from "next/server";
import { getSiteUrl, hasTebexEnv, tebexFetch } from "@/lib/tebex";
import { errorJson } from "@/lib/apiError";
import { isRecord } from "@/lib/safe";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ ident: string }> },
) {
  if (!hasTebexEnv()) {
    return NextResponse.json(
      {
        error:
          "Missing Tebex env vars. Set TEBEX_WEBSTORE_TOKEN, TEBEX_PUBLIC_TOKEN, TEBEX_PRIVATE_KEY.",
      },
      { status: 500 },
    );
  }

  try {
    const { ident } = await params;
    const url = new URL(req.url);

    const rawReturnUrl = url.searchParams.get("returnUrl") ?? "";
    const returnUrl = normalizeReturnUrl({
      returnUrl: rawReturnUrl,
      requestOrigin: url.origin,
      siteUrl: getSiteUrl(),
    });

    // account-scoped: /api/accounts/{token}/baskets/{basketIdent}/auth
    const authPayload = await tebexFetch<unknown>(
      `/baskets/${encodeURIComponent(ident)}/auth?returnUrl=${encodeURIComponent(
        returnUrl,
      )}`,
      { method: "GET" },
    );

    const authUrl = extractAuthUrl(authPayload);
    if (!authUrl) {
      return NextResponse.json(
        {
          error:
            "Tebex did not return an authentication URL for this basket. Check your store configuration and Tebex response.",
          tebex: authPayload,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ authUrl, tebex: authPayload }, { status: 200 });
  } catch (e) {
    return errorJson(e, 502);
  }
}

function normalizeReturnUrl(args: {
  returnUrl: string;
  requestOrigin: string;
  siteUrl: string;
}): string {
  const trimmed = (args.returnUrl || "").trim();
  const siteUrlTrimmed = (args.siteUrl || "").trim().replace(/\/$/, "");
  const safeDefault = `${siteUrlTrimmed || args.requestOrigin}/store/cart`;

  if (!trimmed) return safeDefault;

  // Allow relative paths.
  if (trimmed.startsWith("/")) {
    return `${args.requestOrigin}${trimmed}`;
  }

  // Allow absolute URLs, but only to our own origin.
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return safeDefault;
  }

  const allowedOrigin = (() => {
    try {
      return siteUrlTrimmed ? new URL(siteUrlTrimmed).origin : args.requestOrigin;
    } catch {
      return args.requestOrigin;
    }
  })();

  return parsed.origin === allowedOrigin ? parsed.toString() : safeDefault;
}

function extractAuthUrl(payload: unknown): string | null {
  if (typeof payload === "string") {
    return looksLikeAuthUrl(payload) ? payload : null;
  }

  if (Array.isArray(payload)) {
    for (const v of payload) {
      const found = extractAuthUrl(v);
      if (found) return found;
    }
    return null;
  }

  if (!isRecord(payload)) return null;

  // Prefer any obvious "url" field.
  for (const [k, v] of Object.entries(payload)) {
    if (typeof v === "string" && k.toLowerCase().includes("url")) {
      if (looksLikeAuthUrl(v)) return v;
    }
  }

  for (const v of Object.values(payload)) {
    const found = extractAuthUrl(v);
    if (found) return found;
  }

  return null;
}

function looksLikeAuthUrl(url: string): boolean {
  const s = url.trim();
  if (!/^https?:\/\//i.test(s)) return false;
  // Tebex auth URLs are hosted by Tebex; avoid returning arbitrary URLs.
  if (!/tebex/i.test(s)) return false;
  return true;
}

