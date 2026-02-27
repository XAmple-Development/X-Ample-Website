import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase";

const NOTIFY_EMAIL = process.env.CONTACT_EMAIL || "info@x-ampledevelopment.co.uk";
const FROM_EMAIL = process.env.RESEND_FROM || "Contact Form <onboarding@resend.dev>";

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: Request) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  try {
    const sb = supabaseAdmin();
    const { error } = await sb.from("waitlist").insert({ email }).select("id").single();
    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json(
          { error: "Waitlist is not set up yet. Add the waitlist table in Supabase." },
          { status: 503 }
        );
      }
      if (error.code === "23505") {
        return NextResponse.json({ error: "This email is already on the waitlist." }, { status: 409 });
      }
      console.error("waitlist insert error:", error);
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }

    // Notify admin via Resend (same as contact form)
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const resend = new Resend(apiKey);
      const subject = `Waitlist signup: ${email}`;
      const text = `A new person joined the waitlist.\n\nEmail: ${email}\nTime: ${new Date().toISOString()}`;
      const html = `
        <p><strong>New waitlist signup</strong></p>
        <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
        <p><strong>Time:</strong> ${escapeHtml(new Date().toISOString())}</p>
      `.trim();
      const { error: sendError } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [NOTIFY_EMAIL],
        replyTo: email,
        subject,
        text,
        html,
      });
      if (sendError) console.error("waitlist notify email error:", sendError);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("waitlist error:", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
