import { NextResponse } from "next/server";
import { tebexAccountToken, tebexFetch } from "@/lib/tebex";

export const runtime = "nodejs";

export async function POST() {
  const token = tebexAccountToken();
  const data = await tebexFetch<unknown>(
    `/accounts/${encodeURIComponent(token)}/baskets`,
    { method: "POST", body: JSON.stringify({}) },
  );
  return NextResponse.json(data);
}
