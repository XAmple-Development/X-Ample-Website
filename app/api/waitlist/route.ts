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
          { error: "Newsletter is not set up yet. Add the waitlist table in Supabase." },
          { status: 503 }
        );
      }
      if (error.code === "23505") {
        return NextResponse.json({ error: "This email is already subscribed." }, { status: 409 });
      }
      console.error("newsletter insert error:", error);
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }

    // Send emails via Resend (admin notification + auto-reply to signup)
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const resend = new Resend(apiKey);

      // 1) Notify admin
      const adminSubject = `Newsletter signup: ${email}`;
      const adminText = `A new newsletter subscriber.\n\nEmail: ${email}\nTime: ${new Date().toISOString()}`;
      const adminHtml = `
        <p><strong>New newsletter signup</strong></p>
        <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
        <p><strong>Time:</strong> ${escapeHtml(new Date().toISOString())}</p>
      `.trim();
      const { error: adminError } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [NOTIFY_EMAIL],
        replyTo: email,
        subject: adminSubject,
        text: adminText,
        html: adminHtml,
      });
      if (adminError) console.error("newsletter notify email error:", adminError);

      const replySubject = "You're subscribed – X-Ample Development";
      const replyText = `Thanks for subscribing to studio updates!\n\nWe'll share project news, blog posts, and announcements when there's something worth your time.\n\nIn the meantime, feel free to reach out at ${NOTIFY_EMAIL} or via our website.\n\n— X-Ample Development`;
      const replyHtml = `
        <p>Thanks for subscribing to studio updates!</p>
        <p>We'll share project news, blog posts, and announcements when there's something worth your time.</p>
        <p>In the meantime, feel free to <a href="mailto:${escapeHtml(NOTIFY_EMAIL)}">reach out</a> or visit our website.</p>
        <p>— X-Ample Development</p>
      `.trim();
      const { error: replyError } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [email],
        subject: replySubject,
        text: replyText,
        html: replyHtml,
      });
      if (replyError) console.error("newsletter auto-reply error:", replyError);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("newsletter error:", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
