import { NextResponse } from "next/server";
import { hasTebexAuthEnv, tebexBasketFetch } from "@/lib/tebex";
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
    const body = (await req.json().catch(() => null)) as AddRequest | null;
    if (!body?.package_id) {
      return NextResponse.json(
        { error: "Missing required field: package_id" },
        { status: 400 },
      );
    }

    const payload = {
      package_id: body.package_id,
      quantity: typeof body.quantity === "number" ? body.quantity : 1,
    };

    const added = await tebexBasketFetch<unknown>(
      `/baskets/${encodeURIComponent(ident)}/packages`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );

    return NextResponse.json(added, { status: 200 });
  } catch (e) {
    return errorJson(e, 502);
  }
}

