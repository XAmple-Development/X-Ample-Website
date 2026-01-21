import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { isAdminForSession } from "@/lib/admin";
import { syncPurchasesFromPlugin } from "@/lib/pluginPurchaseSync";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await isAdminForSession(session))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { upserted, scanned } = await syncPurchasesFromPlugin("admin");
    return NextResponse.redirect(new URL(`/dashboard/admin?synced=${upserted}&scanned=${scanned}`, req.url), 303);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Sync failed";
    return NextResponse.redirect(new URL(`/dashboard/admin?error=${encodeURIComponent(msg)}`, req.url), 303);
  }
}

