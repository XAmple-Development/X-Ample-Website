import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { syncPurchasesFromPlugin } from "@/lib/pluginPurchaseSync";

export const runtime = "nodejs";

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export async function POST(req: NextRequest) {
  const secret = mustEnv("CRON_SYNC_SECRET");
  const incoming = req.headers.get("x-cron-secret") ?? "";
  if (incoming !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncPurchasesFromPlugin("cron");
  return NextResponse.json({ ok: true, ...result }, { status: 200 });
}

