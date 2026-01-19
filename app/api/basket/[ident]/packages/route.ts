import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { tebexFetch } from "@/lib/tebex";

export const runtime = "nodejs";

type Body = { packageId: number; quantity?: number };

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ ident: string }> },
) {
  const { ident } = await context.params;

  let body: Partial<Body> = {};
  try {
    body = (await req.json()) as Partial<Body>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const packageId = Number(body.packageId);
  const quantity = Math.max(1, Number(body.quantity ?? 1));

  if (!Number.isFinite(packageId) || packageId <= 0) {
    return NextResponse.json({ error: "Invalid packageId" }, { status: 400 });
  }

  // Tebex: POST /api/baskets/{ident}/packages (no /accounts/{token})
  const data = await tebexFetch<unknown>(`/baskets/${encodeURIComponent(ident)}/packages`, {
    method: "POST",
    body: JSON.stringify({ package_id: packageId, quantity }),
  });

  return NextResponse.json(data, { status: 200 });
}
