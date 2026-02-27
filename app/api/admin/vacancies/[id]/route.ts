import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { hasContentAdminAuth } from "@/lib/contentAdminAuth";
import {
  slugify,
  safeTrim,
  normalizeStatus,
  normalizeUrl,
  normalizeEmail,
  normalizePublishedAt,
  type VacancyStatus,
} from "@/lib/vacancies";

type Params = Promise<{ id: string }>;

export async function GET(req: Request, { params }: { params: Params }) {
  const ok = await hasContentAdminAuth(req);
  if (!ok) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  const sb = supabaseAdmin();
  const { data, error } = await sb.from("vacancies").select("*").eq("id", id).maybeSingle();
  if (error) return NextResponse.json({ error: "Failed to fetch vacancy." }, { status: 500 });
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

  const title = safeTrim(body.title);
  if (!title) return NextResponse.json({ error: "Title is required." }, { status: 400 });
  const slug = body.slug && typeof body.slug === "string" && body.slug.trim() ? body.slug.trim() : slugify(title);
  const status = normalizeStatus(body.status) as VacancyStatus;
  const now = new Date().toISOString();
  let published_at = normalizePublishedAt(body.published_at);
  if (status === "open" && published_at === null) published_at = now;

  const updates = {
    slug,
    title,
    location: body.location && typeof body.location === "string" ? body.location.trim() || null : null,
    type: body.type && typeof body.type === "string" ? body.type.trim() || null : null,
    salary: body.salary && typeof body.salary === "string" ? body.salary.trim() || null : null,
    status,
    published_at,
    body_mdx: body.body_mdx && typeof body.body_mdx === "string" ? body.body_mdx : "",
    apply_url: normalizeUrl(body.apply_url),
    apply_email: normalizeEmail(body.apply_email),
    updated_at: now,
  };

  const sb = supabaseAdmin();
  const { error } = await sb.from("vacancies").update(updates).eq("id", id);
  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Another vacancy already uses this slug." }, { status: 400 });
    return NextResponse.json({ error: "Failed to update vacancy." }, { status: 500 });
  }
  return NextResponse.json({ slug });
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  const ok = await hasContentAdminAuth(req);
  if (!ok) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  const sb = supabaseAdmin();
  const { error } = await sb.from("vacancies").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Failed to delete vacancy." }, { status: 500 });
  return NextResponse.json({ success: true });
}
