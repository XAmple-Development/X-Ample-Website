import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { tebexAccountToken, tebexFetch } from "@/lib/tebex";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ ident: string }> },
) {
  const { ident } = await context.params;

  const token = tebexAccountToken();
  const data = await tebexFetch<unknown>(
    `/accounts/${encodeURIComponent(token)}/baskets/${encodeURIComponent(ident)}`,
    { method: "GET" },
  );

  return NextResponse.json(data);
}
