import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
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
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("waitlist error:", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
