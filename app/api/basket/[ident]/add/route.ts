import { NextResponse } from "next/server";
import { hasTebexEnv, tebexBasketFetch } from "@/lib/tebex";
import { errorJson } from "@/lib/apiError";

export const runtime = "nodejs";

type AddRequest = {
  package_id: number | string;
  quantity?: number;
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

    const body = (await req.json().catch(() => null)) as AddRequest | null;
    if (!body?.package_id) {
      return NextResponse.json(
        { error: "Missing required field: package_id" },
        { status: 400 },
      );
    }

    const quantity =
      typeof body.quantity === "number" && body.quantity > 0 ? body.quantity : 1;

    const added = await tebexBasketFetch<unknown>(
      `/baskets/${encodeURIComponent(ident)}/packages`,
      {
        method: "POST",
        body: JSON.stringify({ package_id: body.package_id, quantity }),
      },
    );

    return NextResponse.json(added, { status: 200 });
  } catch (e) {
    return errorJson(e, 502);
  }
}
