import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  labelForBudget,
  labelForProjectType,
  labelForTimeline,
  type BudgetBand,
  type ProjectType,
  type Timeline,
} from "@/lib/site";

const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "info@x-ampledevelopment.co.uk";
const FROM_EMAIL = process.env.RESEND_FROM || "Contact Form <onboarding@resend.dev>";

const VALID_PROJECT_TYPES = new Set(["discord-bot", "website", "other"]);
const VALID_BUDGETS = new Set(["under-500", "500-1500", "1500-5000", "5000-plus", "unsure"]);
const VALID_TIMELINES = new Set(["asap", "1-4-weeks", "1-3-months", "flexible"]);

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Contact form is not configured." },
      { status: 503 }
    );
  }

  let body: {
    name?: string;
    email?: string;
    message?: string;
    projectType?: string;
    budget?: string;
    timeline?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const projectType =
    typeof body.projectType === "string" && VALID_PROJECT_TYPES.has(body.projectType)
      ? (body.projectType as ProjectType)
      : "";
  const budget =
    typeof body.budget === "string" && VALID_BUDGETS.has(body.budget)
      ? (body.budget as BudgetBand)
      : "";
  const timeline =
    typeof body.timeline === "string" && VALID_TIMELINES.has(body.timeline)
      ? (body.timeline as Timeline)
      : "";

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email, and message are required." },
      { status: 400 }
    );
  }

  if (message.length > 10000) {
    return NextResponse.json(
      { error: "Message is too long." },
      { status: 400 }
    );
  }

  const projectLabel = projectType ? labelForProjectType(projectType) : "Not specified";
  const budgetLabel = budget ? labelForBudget(budget) : "Not specified";
  const timelineLabel = timeline ? labelForTimeline(timeline) : "Not specified";

  const subject = `Contact: ${name} — ${projectLabel}`;
  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Project type: ${projectLabel}`,
    `Budget: ${budgetLabel}`,
    `Timeline: ${timelineLabel}`,
    "",
    "Message:",
    message,
  ].join("\n");

  const html = `
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
    <p><strong>Project type:</strong> ${escapeHtml(projectLabel)}</p>
    <p><strong>Budget:</strong> ${escapeHtml(budgetLabel)}</p>
    <p><strong>Timeline:</strong> ${escapeHtml(timelineLabel)}</p>
    <p><strong>Message:</strong></p>
    <pre style="white-space:pre-wrap;font-family:inherit;">${escapeHtml(message)}</pre>
  `.trim();

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: [CONTACT_EMAIL],
    replyTo: email,
    subject,
    text,
    html,
  });

  if (error) {
    console.error("Resend error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again or email us directly." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
