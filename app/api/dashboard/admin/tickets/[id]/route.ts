import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { isAdminForSession } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

const ALLOWED_STATUS = new Set(["open", "pending", "closed"]);
const ALLOWED_PRIORITY = new Set(["low", "normal", "high"]);

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await isAdminForSession(session))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await context.params;
  const ticketId = id.trim();
  if (!ticketId) return NextResponse.json({ error: "Missing ticket id" }, { status: 400 });

  const form = await req.formData();
  const status = typeof form.get("status") === "string" ? String(form.get("status")).trim() : "";
  const priority = typeof form.get("priority") === "string" ? String(form.get("priority")).trim() : "";

  const patch: Record<string, unknown> = {};
  if (status) {
    if (!ALLOWED_STATUS.has(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    patch.status = status;
  }
  if (priority) {
    if (!ALLOWED_PRIORITY.has(priority)) return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
    patch.priority = priority;
  }
  if (!Object.keys(patch).length) return NextResponse.json({ error: "No changes" }, { status: 400 });

  patch.updated_at = new Date().toISOString();

  const sb = supabaseAdmin();
  const upd = await sb.from("tickets").update(patch).eq("id", ticketId);
  if (upd.error) return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });

  return NextResponse.redirect(new URL(`/dashboard/tickets/${encodeURIComponent(ticketId)}`, req.url), 303);
}

