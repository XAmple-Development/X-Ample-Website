import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { isAdminForSession } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase";
import {
  normalizeEmail,
  normalizeStatus,
  normalizeUrl,
  safeTrim,
  slugify,
} from "@/lib/vacancies";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await isAdminForSession(session))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.redirect(new URL("/dashboard/admin/vacancies?error=invalid_form", url), 303);
  }

  const title = safeTrim(form.get("title"));
  if (!title) return NextResponse.redirect(new URL("/dashboard/admin/vacancies?error=missing_title", url), 303);

  const slugRaw = safeTrim(form.get("slug"));
  const slug = slugify(slugRaw || title);

  const location = safeTrim(form.get("location")) || null;
  const type = safeTrim(form.get("type")) || null;
  const salary = safeTrim(form.get("salary")) || null;
  const body_mdx = safeTrim(form.get("body_mdx")) || "";

  const apply_url = normalizeUrl(form.get("apply_url"));
  const apply_email = normalizeEmail(form.get("apply_email"));
  const status = normalizeStatus(form.get("status"));

  const now = new Date().toISOString();
  const sb = supabaseAdmin();

  // Auto publish time when status is open.
  const published_at = status === "open" ? now : null;

  const ins = await sb
    .from("vacancies")
    .insert({
      slug,
      title,
      location,
      type,
      salary,
      body_mdx,
      apply_url,
      apply_email,
      status,
      published_at,
      created_at: now,
      updated_at: now,
    })
    .select("id")
    .maybeSingle();

  if (ins.error || !ins.data?.id) {
    const msg = encodeURIComponent(ins.error?.message ?? "create_failed");
    return NextResponse.redirect(new URL(`/dashboard/admin/vacancies?error=${msg}`, url), 303);
  }

  return NextResponse.redirect(new URL(`/dashboard/admin/vacancies?created=${ins.data.id}`, url), 303);
}

