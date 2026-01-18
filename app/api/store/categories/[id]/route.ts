import { NextRequest, NextResponse } from "next/server";
import { hasTebexAccountEnv, tebexAccountFetch } from "@/lib/tebex";
import { errorJson } from "@/lib/apiError";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!hasTebexAccountEnv()) {
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
    if (!/^\d+$/.test(id)) {
      return NextResponse.json(
        { error: `Invalid category id: ${id}` },
        { status: 400 },
      );
    }

    const data = await tebexAccountFetch<unknown>(
      `/categories/${encodeURIComponent(id)}?includePackages=1`,
    );
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return errorJson(e, 502);
  }
}

