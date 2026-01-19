import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSiteUrl, hasTebexEnv, tebexAccountFetch } from "@/lib/tebex";
import { errorJson } from "@/lib/apiError";

export const runtime = "nodejs";

type CreateBasketRequest = {
  complete_url?: string;
  cancel_url?: string;
};

type TebexCreateBasketResponse = {
  data?: { ident?: string };
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
    const rawSiteUrl = getSiteUrl();
    const siteUrl = rawSiteUrl ? rawSiteUrl.replace(/\/$/, "") : "";

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
    const basket = await tebexAccountFetch<TebexCreateBasketResponse>("/baskets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const ident = basket?.data?.ident;
    if (ident) {
      const jar = await cookies();
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
