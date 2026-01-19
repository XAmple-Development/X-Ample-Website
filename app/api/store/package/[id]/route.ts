import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { tebexAccountToken, tebexFetch } from "@/lib/tebex";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const token = tebexAccountToken();

  const data = await tebexFetch<unknown>(
    `/accounts/${encodeURIComponent(token)}/packages/${encodeURIComponent(id)}`,
    { method: "GET" },
  );

  return NextResponse.json(data);
}
