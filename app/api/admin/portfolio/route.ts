import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { hasContentAdminAuth } from "@/lib/contentAdminAuth";
import { normalizeSortOrder, normalizeUrl, safeTrim } from "@/lib/portfolio";

export async function GET(req: Request) {
  const ok = await hasContentAdminAuth(req);
  if (!ok) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const sb = supabaseAdmin();
  const { data, error } = await sb.from("portfolio_page").select("intro").eq("id", 1).maybeSingle();
  if (error && error.code !== "42P01") {
    return NextResponse.json({ error: "Failed to load portfolio page." }, { status: 500 });
  }
  return NextResponse.json({ intro: data?.intro ?? "" });
}

export async function PUT(req: Request) {
  const ok = await hasContentAdminAuth(req);
  if (!ok) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  let body: { intro?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const intro = typeof body.intro === "string" ? body.intro.trim() : "";
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("portfolio_page")
    .upsert({ id: 1, intro, updated_at: new Date().toISOString() }, { onConflict: "id" });

  if (error) {
    return NextResponse.json(
      { error: "Portfolio page table missing. Run the SQL in supabase/schema.sql." },
      { status: 500 }
    );
  }
  return NextResponse.json({ success: true });
}
