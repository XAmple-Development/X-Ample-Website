import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

function wantsHtml(req: NextRequest) {
  const accept = req.headers.get("accept") ?? "";
  return accept.includes("text/html");
}

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("tickets")
    .select("id, subject, status, priority, created_at, updated_at")
    .eq("user_id", session.userId)
    .order("updated_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: "Failed to load tickets" }, { status: 500 });
  return NextResponse.json({ data: data ?? [] }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ct = req.headers.get("content-type") ?? "";
  let subject = "";
  let message = "";

  if (ct.includes("application/json")) {
    const json = (await req.json().catch(() => null)) as any;
    subject = typeof json?.subject === "string" ? json.subject : "";
    message = typeof json?.message === "string" ? json.message : "";
  } else {
    const form = await req.formData();
    subject = typeof form.get("subject") === "string" ? String(form.get("subject")) : "";
    message = typeof form.get("message") === "string" ? String(form.get("message")) : "";
  }

  subject = subject.trim();
  message = message.trim();
  if (!subject || !message) {
    return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const now = new Date().toISOString();

  const ticketIns = await sb
    .from("tickets")
    .insert({
      user_id: session.userId,
      subject,
      status: "open",
      priority: "normal",
      created_at: now,
      updated_at: now,
    })
    .select("id")
    .maybeSingle();

  if (ticketIns.error || !ticketIns.data?.id) {
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
  }

  const ticketId = ticketIns.data.id as string;

  const msgIns = await sb.from("ticket_messages").insert({
    ticket_id: ticketId,
    author_user_id: session.userId,
    body: message,
    created_at: now,
  });

  if (msgIns.error) {
    return NextResponse.json({ error: "Failed to create first message" }, { status: 500 });
  }

  // For HTML form POSTs, redirect to the new ticket page.
  if (wantsHtml(req)) {
    return NextResponse.redirect(new URL(`/dashboard/tickets/${encodeURIComponent(ticketId)}`, req.url), 303);
  }

  return NextResponse.json({ data: { id: ticketId } }, { status: 201 });
}

