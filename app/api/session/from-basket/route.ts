import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createDashboardSessionFromBasketIdent } from "@/lib/createDashboardSession";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const json = (await req.json().catch(() => null)) as any;
  const ident = typeof json?.ident === "string" ? json.ident : "";

  try {
    await createDashboardSessionFromBasketIdent(ident);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create session" },
      { status: 400 },
    );
  }
}

