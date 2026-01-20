import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequest, isAdminForCustomerId } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const ticketId = id.trim();
  if (!ticketId) return NextResponse.json({ error: "Missing ticket id" }, { status: 400 });

  const sb = supabaseAdmin();

  // Ensure the requester can access this ticket (owner or admin).
  const ticket = await sb
    .from("tickets")
    .select("id, user_id, subject, status, priority, created_at, updated_at")
    .eq("id", ticketId)
    .maybeSingle();

  if (ticket.error || !ticket.data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = isAdminForCustomerId(session.tebexCustomerId);
  if (!isAdmin && ticket.data.user_id !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await sb
    .from("ticket_messages")
    .select("id, ticket_id, author_user_id, body, created_at")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true })
    .limit(500);

  if (error) return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
  return NextResponse.json({ data: { ticket: ticket.data, messages: data ?? [] } }, { status: 200 });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const ticketId = id.trim();
  if (!ticketId) return NextResponse.json({ error: "Missing ticket id" }, { status: 400 });

  const ct = req.headers.get("content-type") ?? "";
  let body = "";
  if (ct.includes("application/json")) {
    const json = (await req.json().catch(() => null)) as any;
    body = typeof json?.body === "string" ? json.body : "";
  } else {
    const form = await req.formData();
    body = typeof form.get("body") === "string" ? String(form.get("body")) : "";
  }
  body = body.trim();
  if (!body) return NextResponse.json({ error: "Message body is required" }, { status: 400 });

  const sb = supabaseAdmin();

  const ticket = await sb.from("tickets").select("id, user_id").eq("id", ticketId).maybeSingle();
  if (ticket.error || !ticket.data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = isAdminForCustomerId(session.tebexCustomerId);
  if (!isAdmin && ticket.data.user_id !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date().toISOString();
  const ins = await sb.from("ticket_messages").insert({
    ticket_id: ticketId,
    author_user_id: session.userId,
    body,
    created_at: now,
  });
  if (ins.error) return NextResponse.json({ error: "Failed to create message" }, { status: 500 });

  await sb.from("tickets").update({ updated_at: now }).eq("id", ticketId);
  return NextResponse.json({ ok: true }, { status: 201 });
}

