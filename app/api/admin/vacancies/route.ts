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

export async function GET(req: Request) {
  const ok = await hasContentAdminAuth(req);
  if (!ok) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("vacancies")
    .select("id, slug, title, location, type, salary, status, published_at, updated_at")
    .order("updated_at", { ascending: false })
    .limit(100);
  if (error) {
    console.error("admin vacancies list error:", error);
    return NextResponse.json({ error: "Failed to list vacancies." }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  const ok = await hasContentAdminAuth(req);
  if (!ok) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const title = safeTrim(body.title);
  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }
  const slug = body.slug && typeof body.slug === "string" && body.slug.trim() ? body.slug.trim() : slugify(title);
  const status = normalizeStatus(body.status) as VacancyStatus;
  const now = new Date().toISOString();
  const published_at = status === "open" ? normalizePublishedAt(body.published_at) ?? now : normalizePublishedAt(body.published_at);

  const row = {
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
  const { data, error } = await sb.from("vacancies").insert(row).select("id").single();
  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "A vacancy with this slug already exists." }, { status: 400 });
    console.error("admin vacancy create error:", error);
    return NextResponse.json({ error: "Failed to create vacancy." }, { status: 500 });
  }
  return NextResponse.json({ id: data.id, slug });
}
