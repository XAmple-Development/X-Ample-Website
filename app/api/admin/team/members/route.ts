import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { hasContentAdminAuth } from "@/lib/contentAdminAuth";
import { safeTrim, normalizeUrl, normalizeSortOrder } from "@/lib/team";

export async function GET(req: Request) {
  const ok = await hasContentAdminAuth(req);
  if (!ok) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("team_members")
    .select("id, name, role, bio, avatar_url, discord_url, github_url, twitter_url, sort_order, updated_at")
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Failed to list team members." }, { status: 500 });
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
  const name = safeTrim(body.name);
  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });

  const row = {
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
  const { data, error } = await sb.from("team_members").insert(row).select("id").single();
  if (error) return NextResponse.json({ error: "Failed to create team member." }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
