import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { hasContentAdminAuth } from "@/lib/contentAdminAuth";
import {
  slugify,
  safeTrim,
  normalizeBlogStatus,
  normalizePublishedAt,
  type BlogPostStatus,
} from "@/lib/blogPosts";

export async function GET(req: Request) {
  const ok = await hasContentAdminAuth(req);
  if (!ok) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("blog_posts")
    .select("id, slug, title, excerpt, status, published_at, updated_at")
    .order("updated_at", { ascending: false })
    .limit(100);
  if (error) {
    console.error("admin blog list error:", error);
    return NextResponse.json({ error: "Failed to list blog posts." }, { status: 500 });
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
  const slug =
    body.slug && typeof body.slug === "string" && body.slug.trim()
      ? body.slug.trim()
      : slugify(title);
  const status = normalizeBlogStatus(body.status) as BlogPostStatus;
  const now = new Date().toISOString();
  const published_at =
    status === "published"
      ? normalizePublishedAt(body.published_at) ?? now
      : normalizePublishedAt(body.published_at);

  const row = {
    slug,
    title,
    excerpt: body.excerpt && typeof body.excerpt === "string" ? body.excerpt.trim() || null : null,
    status,
    published_at,
    body_mdx: body.body_mdx && typeof body.body_mdx === "string" ? body.body_mdx : "",
    updated_at: now,
  };

  const sb = supabaseAdmin();
  const { data, error } = await sb.from("blog_posts").insert(row).select("id").single();
  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "A post with this slug already exists." }, { status: 400 });
    }
    console.error("admin blog create error:", error);
    return NextResponse.json({ error: "Failed to create post." }, { status: 500 });
  }
  return NextResponse.json({ id: data.id, slug });
}
