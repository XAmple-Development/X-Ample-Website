import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSiteUrl, hasTebexEnv, tebexFetch } from "@/lib/tebex";

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

  const basket = await tebexFetch<any>("/baskets", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const ident =
    basket?.ident ?? basket?.data?.ident ?? basket?.basket?.ident ?? null;
  if (typeof ident === "string" && ident.length > 0) {
    const jar = cookies();
    jar.set("xa_basket", ident, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  return NextResponse.json(basket, { status: 200 });
}

