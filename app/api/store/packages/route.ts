import { NextResponse } from "next/server";
import { tebexAccountToken, tebexFetch } from "@/lib/tebex";

export const runtime = "nodejs";

export async function GET() {
  const token = tebexAccountToken();
  const data = await tebexFetch<unknown>(
    `/accounts/${encodeURIComponent(token)}/packages`,
    { method: "GET" },
  );
  return NextResponse.json(data);
}
