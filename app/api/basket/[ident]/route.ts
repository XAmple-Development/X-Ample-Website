import { NextResponse } from "next/server";
import { tebexAccountToken, tebexFetch } from "@/lib/tebex";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { ident: string } }) {
  const token = tebexAccountToken();
  const data = await tebexFetch<unknown>(
    `/accounts/${encodeURIComponent(token)}/baskets/${encodeURIComponent(params.ident)}`,
    { method: "GET" },
  );
  return NextResponse.json(data);
}
