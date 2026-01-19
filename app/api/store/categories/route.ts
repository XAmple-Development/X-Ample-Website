import { NextResponse } from "next/server";
import { tebexAccountToken, tebexFetch } from "@/lib/tebex";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const includePackages = url.searchParams.get("includePackages") ?? "1";

  const token = tebexAccountToken();
  const data = await tebexFetch<unknown>(
    `/accounts/${encodeURIComponent(token)}/categories?includePackages=${encodeURIComponent(includePackages)}`,
    { method: "GET" },
  );

  return NextResponse.json(data);
}
