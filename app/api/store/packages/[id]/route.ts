import { NextResponse } from "next/server";
import { hasTebexEnv, tebexFetch } from "@/lib/tebex";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
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

  const { id } = params;
  const data = await tebexFetch<unknown>(`/packages/${encodeURIComponent(id)}`);
  return NextResponse.json(data, { status: 200 });
}

