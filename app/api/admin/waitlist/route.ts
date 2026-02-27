import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { hasContentAdminAuth } from "@/lib/contentAdminAuth";

export async function GET(req: Request) {
  const ok = await hasContentAdminAuth(req);
  if (!ok) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const sb = supabaseAdmin();
    const { data, error } = await sb
      .from("waitlist")
      .select("id, email, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json(
          { error: "Waitlist table not found. Run the waitlist SQL in supabase/schema.sql." },
          { status: 503 }
        );
      }
      return NextResponse.json({ error: "Failed to load waitlist." }, { status: 500 });
    }
    return NextResponse.json(data ?? []);
  } catch (e) {
    console.error("admin waitlist error:", e);
    return NextResponse.json({ error: "Failed to load waitlist." }, { status: 500 });
  }
}
