import { NextResponse } from "next/server";
import { hasTebexEnv, tebexFetch } from "@/lib/tebex";
import { errorJson } from "@/lib/apiError";

export const runtime = "nodejs";

export async function GET() {
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
    const data = await tebexFetch<unknown>("/categories?includePackages=1");
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return errorJson(e, 502);
  }
}

