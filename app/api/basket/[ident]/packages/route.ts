import { NextResponse } from "next/server";
import { tebexFetch } from "@/lib/tebex";

export const runtime = "nodejs";

type Body = { packageId: number; quantity?: number };

export async function POST(req: Request, { params }: { params: { ident: string } }) {
  const body = (await req.json()) as Partial<Body>;
  const packageId = Number(body.packageId);
  const quantity = Math.max(1, Number(body.quantity ?? 1));

  if (!Number.isFinite(packageId) || packageId <= 0) {
    return NextResponse.json({ error: "Invalid packageId" }, { status: 400 });
  }

  // NOTE: Tebex uses /api/baskets/{ident}/packages (no /accounts/{token} here)
  const data = await tebexFetch<unknown>(
    `/baskets/${encodeURIComponent(params.ident)}/packages`,
    {
      method: "POST",
      body: JSON.stringify({ package_id: packageId, quantity }),
    },
  );

  return NextResponse.json(data);
}
