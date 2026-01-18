import { NextRequest, NextResponse } from "next/server";
import { hasTebexAuthEnv, tebexBasketFetch } from "@/lib/tebex";
import { errorJson } from "@/lib/apiError";

export const runtime = "nodejs";

type RemoveRequest = {
  package_id: number | string;
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ ident: string }> },
) {
  if (!hasTebexAuthEnv()) {
    return NextResponse.json(
      {
        error:
          "Missing Tebex env vars. Set TEBEX_PUBLIC_TOKEN and TEBEX_PRIVATE_KEY.",
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

    const removed = await tebexBasketFetch<unknown>(
      `/baskets/${encodeURIComponent(ident)}/packages/remove`,
      {
        method: "POST",
        body: JSON.stringify({ package_id: body.package_id }),
      },
    );

    return NextResponse.json(removed, { status: 200 });
  } catch (e) {
    return errorJson(e, 502);
  }
}

