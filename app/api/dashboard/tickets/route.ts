import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

function wantsHtml(req: NextRequest) {
  // Accept header isn't always reliable in Safari; treat navigations/form-posts as HTML.
  const accept = req.headers.get("accept") ?? "";
  const dest = req.headers.get("sec-fetch-dest") ?? "";
  const mode = req.headers.get("sec-fetch-mode") ?? "";
  if (dest === "document" || mode === "navigate") return true;
  return accept.includes("text/html");
}

async function readField(req: NextRequest, field: string): Promise<string> {
  const ct = req.headers.get("content-type") ?? "";

  if (ct.includes("application/json")) {
    const json = (await req.json().catch(() => null)) as any;
    return typeof json?.[field] === "string" ? String(json[field]) : "";
  }

  if (ct.includes("application/x-www-form-urlencoded")) {
    // NOTE: do not use this helper for multiple fields; urlencoded bodies can only be read once.
    const text = await req.text();
    const params = new URLSearchParams(text);
    const v = params.get(field);
    return typeof v === "string" ? v : "";
  }

  try {
    const form = await req.formData();
    const v = form.get(field);
    return typeof v === "string" ? v : "";
  } catch {
    return "";
  }
}

async function readTicketCreatePayload(req: NextRequest): Promise<{ subject: string; message: string; isFormPost: boolean }> {
  const ct = req.headers.get("content-type") ?? "";
  const isFormPost = ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data");

  if (ct.includes("application/json")) {
    const json = (await req.json().catch(() => null)) as any;
    return {
      subject: typeof json?.subject === "string" ? String(json.subject) : "",
      message: typeof json?.message === "string" ? String(json.message) : "",
      isFormPost,
    };
  }

  if (ct.includes("application/x-www-form-urlencoded")) {
    const text = await req.text();
    const params = new URLSearchParams(text);
    return {
      subject: params.get("subject") ?? "",
      message: params.get("message") ?? "",
      isFormPost: true,
    };
  }

  try {
    const form = await req.formData();
    return {
      subject: typeof form.get("subject") === "string" ? String(form.get("subject")) : "",
      message: typeof form.get("message") === "string" ? String(form.get("message")) : "",
      isFormPost,
    };
  } catch {
    // Fallback: try single-field reads (may still fail if body was already consumed elsewhere)
    return {
      subject: await readField(req, "subject"),
      message: await readField(req, "message"),
      isFormPost,
    };
  }
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

  const payload = await readTicketCreatePayload(req);
  const isFormPost = payload.isFormPost;

  let subject = payload.subject.trim();
  let message = payload.message.trim();

  subject = subject.trim();
  message = message.trim();
  if (!subject || !message) {
    if (wantsHtml(req) || isFormPost) {
      return NextResponse.redirect(new URL("/dashboard/tickets/new?error=missing_fields", req.url), 303);
    }
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
    if (wantsHtml(req) || isFormPost) {
      return NextResponse.redirect(new URL("/dashboard/tickets/new?error=create_failed", req.url), 303);
    }
    return NextResponse.json(
      {
        error: "Failed to create ticket",
        supabase: ticketIns.error
          ? {
              message: ticketIns.error.message,
              code: ticketIns.error.code,
              details: ticketIns.error.details,
              hint: ticketIns.error.hint,
            }
          : null,
      },
      { status: 500 },
    );
  }

  const ticketId = ticketIns.data.id as string;

  const msgIns = await sb.from("ticket_messages").insert({
    ticket_id: ticketId,
    author_user_id: session.userId,
    body: message,
    created_at: now,
  });

  if (msgIns.error) {
    if (wantsHtml(req) || isFormPost) {
      return NextResponse.redirect(new URL(`/dashboard/tickets/${encodeURIComponent(ticketId)}?error=message_failed`, req.url), 303);
    }
    return NextResponse.json(
      {
        error: "Failed to create first message",
        supabase: {
          message: msgIns.error.message,
          code: msgIns.error.code,
          details: msgIns.error.details,
          hint: msgIns.error.hint,
        },
      },
      { status: 500 },
    );
  }

  // For HTML form POSTs, redirect to the new ticket page.
  if (wantsHtml(req) || isFormPost) {
    return NextResponse.redirect(new URL(`/dashboard/tickets/${encodeURIComponent(ticketId)}`, req.url), 303);
  }

  return NextResponse.json({ data: { id: ticketId } }, { status: 201 });
}

