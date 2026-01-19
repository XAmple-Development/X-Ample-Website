import { NextResponse } from "next/server";
import { getSiteUrl, hasTebexEnv, tebexFetch } from "@/lib/tebex";
import { errorJson } from "@/lib/apiError";
import { isRecord } from "@/lib/safe";

export const runtime = "nodejs";

type TebexAuthLink = { name?: string; url?: string };

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
    const provider = (url.searchParams.get("provider") ?? "").trim();
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

    const authUrl = extractAuthUrl(authPayload, provider || "FiveM");
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

    return NextResponse.json(
      { authUrl, provider: provider || "FiveM", returnUrl, tebex: authPayload },
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

function extractAuthUrl(payload: unknown, preferredProvider: string): string | null {
  // Tebex docs: response is an array of { name, url } objects:
  // https://docs.tebex.io/developers/headless-api/endpoints#get-authentication-links-for-a-basket
  const links = flattenAuthLinks(payload);

  const preferred = preferredProvider.trim().toLowerCase();
  if (preferred) {
    const match = links.find(
      (l) =>
        typeof l.name === "string" &&
        l.name.trim().toLowerCase() === preferred &&
        typeof l.url === "string" &&
        looksLikeUrl(l.url),
    );
    if (match?.url) return match.url;
  }

  const first = links.find((l) => typeof l.url === "string" && looksLikeUrl(l.url));
  return first?.url ?? null;
}

function flattenAuthLinks(payload: unknown): TebexAuthLink[] {
  if (Array.isArray(payload)) {
    return payload.flatMap((v) => flattenAuthLinks(v));
  }
  if (isRecord(payload)) {
    const url = payload.url;
    const name = payload.name;
    if (typeof url === "string") {
      return [{ url, name: typeof name === "string" ? name : undefined }];
    }
    return Object.values(payload).flatMap((v) => flattenAuthLinks(v));
  }
  return [];
}

function looksLikeUrl(url: string): boolean {
  const s = url.trim();
  if (!/^https?:\/\//i.test(s)) return false;
  // Basic sanity; URL is provided by Tebex API response.
  try {
    // eslint-disable-next-line no-new
    new URL(s);
    return true;
  } catch {
    return false;
  }
}

