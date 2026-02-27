import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { hasContentAdminAuth } from "@/lib/contentAdminAuth";
import { safeTrim, normalizeUrl, normalizeSortOrder } from "@/lib/team";

type Params = Promise<{ id: string }>;

export async function GET(req: Request, { params }: { params: Params }) {
  const ok = await hasContentAdminAuth(req);
  if (!ok) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  const sb = supabaseAdmin();
  const { data, error } = await sb.from("team_members").select("*").eq("id", id).maybeSingle();
  if (error) return NextResponse.json({ error: "Failed to fetch member." }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req: Request, { params }: { params: Params }) {
  const ok = await hasContentAdminAuth(req);
  if (!ok) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }
  const name = safeTrim(body.name);
  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });

  const updates = {
    name,
    role: body.role && typeof body.role === "string" ? body.role.trim() || null : null,
    bio: body.bio && typeof body.bio === "string" ? body.bio.trim() || null : null,
    avatar_url: normalizeUrl(body.avatar_url) || (typeof body.avatar_url === "string" ? body.avatar_url.trim() || null : null),
    discord_url: normalizeUrl(body.discord_url),
    github_url: normalizeUrl(body.github_url),
    twitter_url: normalizeUrl(body.twitter_url),
    sort_order: normalizeSortOrder(body.sort_order),
    updated_at: new Date().toISOString(),
  };

  const sb = supabaseAdmin();
  const { error } = await sb.from("team_members").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: "Failed to update member." }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  const ok = await hasContentAdminAuth(req);
  if (!ok) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  const sb = supabaseAdmin();
  const { error } = await sb.from("team_members").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Failed to delete member." }, { status: 500 });
  return NextResponse.json({ success: true });
}
