import { NextResponse } from "next/server";
import { hasTebexEnv, tebexBasketFetch } from "@/lib/tebex";
import { errorJson } from "@/lib/apiError";

export const runtime = "nodejs";

type QuantityRequest = {
  package_id: number | string;
  quantity: number;
};

export async function POST(
  req: Request,
  { params }: { params: { ident: string } },
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
    const { ident } = params;
    const body = (await req.json().catch(() => null)) as QuantityRequest | null;

    if (!body?.package_id) {
      return NextResponse.json(
        { error: "Missing required field: package_id" },
        { status: 400 },
      );
    }
    if (typeof body.quantity !== "number" || body.quantity < 0) {
      return NextResponse.json(
        { error: "Missing/invalid required field: quantity" },
        { status: 400 },
      );
    }

    const pkgId = encodeURIComponent(String(body.package_id));

    // basket-scoped update
    const updated = await tebexBasketFetch<unknown>(
      `/baskets/${encodeURIComponent(ident)}/packages/${pkgId}`,
      {
        method: "PUT",
        body: JSON.stringify({ quantity: body.quantity }),
      },
    );

    return NextResponse.json(updated, { status: 200 });
  } catch (e) {
    return errorJson(e, 502);
  }
}
