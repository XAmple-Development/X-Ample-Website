import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { hasContentAdminAuth } from "@/lib/contentAdminAuth";
import { normalizeSortOrder, normalizeUrl, safeTrim } from "@/lib/portfolio";

export async function GET(req: Request) {
  const ok = await hasContentAdminAuth(req);
  if (!ok) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("portfolio_items")
    .select("id, title, description, category, image_url, project_url, sort_order, updated_at")
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to list portfolio items." }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  const ok = await hasContentAdminAuth(req);
  if (!ok) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const title = safeTrim(body.title);
  if (!title) return NextResponse.json({ error: "Title is required." }, { status: 400 });

  const row = {
    title,
    description: safeTrim(body.description) || "",
    category: body.category && typeof body.category === "string" ? body.category.trim() || null : null,
    image_url: normalizeUrl(body.image_url) || (typeof body.image_url === "string" ? body.image_url.trim() || null : null),
    project_url: normalizeUrl(body.project_url),
    sort_order: normalizeSortOrder(body.sort_order),
    updated_at: new Date().toISOString(),
  };

  const sb = supabaseAdmin();
  const { data, error } = await sb.from("portfolio_items").insert(row).select("id").single();
  if (error) {
    return NextResponse.json({ error: "Failed to create portfolio item." }, { status: 500 });
  }
  return NextResponse.json({ id: data.id });
}
