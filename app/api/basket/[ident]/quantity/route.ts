import { NextRequest, NextResponse } from "next/server";
import { hasTebexEnv, tebexFetch } from "@/lib/tebex";
import { errorJson } from "@/lib/apiError";

export const runtime = "nodejs";

type UpdateQuantityRequest = {
  package_id: number | string;
  quantity: number;
};

export async function PUT(
  req: NextRequest,
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
    const body = (await req.json().catch(() => null)) as
      | UpdateQuantityRequest
      | null;
    if (!body?.package_id || typeof body.quantity !== "number") {
      return NextResponse.json(
        { error: "Missing required fields: package_id, quantity" },
        { status: 400 },
      );
    }

    const data = await tebexFetch<unknown>(
      `/baskets/${encodeURIComponent(ident)}/packages/${encodeURIComponent(
        String(body.package_id),
      )}`,
      {
        method: "PUT",
        body: JSON.stringify({ quantity: body.quantity }),
      },
    );

    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return errorJson(e, 502);
  }
}

