import { NextResponse } from "next/server";
import { hasTebexEnv, tebexFetch } from "@/lib/tebex";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
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

  const { ident } = params;
  const data = await tebexFetch<unknown>(`/baskets/${encodeURIComponent(ident)}`);
  return NextResponse.json(data, { status: 200 });
}

