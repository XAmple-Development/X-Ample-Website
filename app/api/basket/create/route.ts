import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSiteUrl, hasTebexEnv, tebexFetch } from "@/lib/tebex";
import { getIn, getProp, isRecord } from "@/lib/safe";
import { errorJson } from "@/lib/apiError";

export const runtime = "nodejs";

type CreateBasketRequest = {
  complete_url?: string;
  cancel_url?: string;
};

export async function POST(req: Request) {
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
    const siteUrl = getSiteUrl();
    const body = (await req.json().catch(() => ({}))) as CreateBasketRequest;

    const complete_url =
      body.complete_url ?? (siteUrl ? `${siteUrl}/store/complete` : undefined);
    const cancel_url =
      body.cancel_url ?? (siteUrl ? `${siteUrl}/store/cancel` : undefined);

    const payload: Record<string, unknown> = {
      complete_auto_redirect: true,
      custom: { source: "x-ample-website" },
    };
    if (complete_url) payload.complete_url = complete_url;
    if (cancel_url) payload.cancel_url = cancel_url;

    // account-scoped: /api/accounts/{token}/baskets
    const basket = await tebexFetch<unknown>("/baskets", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const ident = extractBasketIdent(basket);
    if (ident) {
      const jar = await cookies(); // <-- FIX
      jar.set("xa_basket", ident, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return NextResponse.json(basket, { status: 200 });
  } catch (e) {
    return errorJson(e, 502);
  }
}

function extractBasketIdent(payload: unknown): string | null {
  const direct = getProp(payload, "ident");
  if (typeof direct === "string" && direct.length > 0) return direct;

  const dataIdent = getIn(payload, ["data", "ident"]);
  if (typeof dataIdent === "string" && dataIdent.length > 0) return dataIdent;

  const basketIdent = getIn(payload, ["basket", "ident"]);
  if (typeof basketIdent === "string" && basketIdent.length > 0)
    return basketIdent;

  const nestedBasketIdent = getIn(payload, ["data", "basket", "ident"]);
  if (typeof nestedBasketIdent === "string" && nestedBasketIdent.length > 0)
    return nestedBasketIdent;

  if (isRecord(payload)) {
    for (const v of Object.values(payload)) {
      const found = extractBasketIdent(v);
      if (found) return found;
    }
  }
  return null;
}
