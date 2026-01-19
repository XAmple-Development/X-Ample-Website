import { NextResponse } from "next/server";
import { hasTebexEnv, tebexBasketFetch } from "@/lib/tebex";
import { errorJson } from "@/lib/apiError";

export const runtime = "nodejs";

type RemoveRequest = {
  package_id: number | string;
};

export async function POST(
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

    const body = (await req.json().catch(() => null)) as RemoveRequest | null;

    if (!body?.package_id) {
      return NextResponse.json(
        { error: "Missing required field: package_id" },
        { status: 400 },
      );
    }

    const pkgId = encodeURIComponent(String(body.package_id));

    const removed = await tebexBasketFetch<unknown>(
      `/baskets/${encodeURIComponent(ident)}/packages/${pkgId}`,
      { method: "DELETE" },
    );

    return NextResponse.json(removed, { status: 200 });
  } catch (e) {
    return errorJson(e, 502);
  }
}
