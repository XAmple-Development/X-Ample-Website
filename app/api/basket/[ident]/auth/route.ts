import { NextResponse } from "next/server";
import { getSiteUrl, hasTebexEnv, tebexFetch } from "@/lib/tebex";
import { errorJson } from "@/lib/apiError";

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
    const authLinks = await tebexFetch<unknown>(
      `/baskets/${encodeURIComponent(ident)}/auth?returnUrl=${encodeURIComponent(
        returnUrl,
      )}`,
      { method: "GET" },
    );

    // Tebex docs: returns an array of { name, url } auth links.
    return NextResponse.json(
      { returnUrl, data: authLinks },
      { status: 200 },
    );
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

