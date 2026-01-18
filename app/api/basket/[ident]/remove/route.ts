import { NextRequest, NextResponse } from "next/server";
import { hasTebexEnv, tebexFetch } from "@/lib/tebex";

export const runtime = "nodejs";

type RemoveRequest = {
  package_id: number | string;
};

export async function POST(
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

  const { ident } = await params;
  const body = (await req.json().catch(() => null)) as RemoveRequest | null;
  if (!body?.package_id) {
    return NextResponse.json(
      { error: "Missing required field: package_id" },
      { status: 400 },
    );
  }

  const removed = await tebexFetch<unknown>(
    `/baskets/${encodeURIComponent(ident)}/packages/remove`,
    {
      method: "POST",
      body: JSON.stringify({ package_id: body.package_id }),
    },
  );

  return NextResponse.json(removed, { status: 200 });
}

