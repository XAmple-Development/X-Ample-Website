import { NextRequest, NextResponse } from "next/server";
import { hasTebexEnv, tebexFetch } from "@/lib/tebex";
import { errorJson } from "@/lib/apiError";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
    const { id } = await params;
    // Avoid Tebex calls with invalid IDs (prevents noisy 502s from `/undefined`).
    if (!/^\d+$/.test(id)) {
      return NextResponse.json(
        { error: `Invalid package id: ${id}` },
        { status: 400 },
      );
    }
    const data = await tebexFetch<unknown>(
      `/packages/${encodeURIComponent(id)}`,
    );
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return errorJson(e, 502);
  }
}

