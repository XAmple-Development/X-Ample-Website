import { NextResponse } from "next/server";
import { hasTebexEnv, tebexFetch } from "@/lib/tebex";
import { errorJson } from "@/lib/apiError";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
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

    const basket = await tebexFetch<unknown>(
      `/baskets/${encodeURIComponent(ident)}`,
      { method: "GET" },
    );

    return NextResponse.json(basket, { status: 200 });
  } catch (e) {
    return errorJson(e, 502);
  }
}
