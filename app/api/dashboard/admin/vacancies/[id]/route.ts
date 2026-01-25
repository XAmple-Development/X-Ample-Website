import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { isAdminForSession } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase";
import { normalizeEmail, normalizePublishedAt, normalizeStatus, normalizeUrl, safeTrim, slugify } from "@/lib/vacancies";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await isAdminForSession(session))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await context.params;
  const vacancyId = id.trim();
  if (!vacancyId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const url = new URL(req.url);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.redirect(new URL("/dashboard/admin/vacancies?error=invalid_form", url), 303);
  }

  const action = safeTrim(form.get("action")) || "update";

  const sb = supabaseAdmin();

  if (action === "delete") {
    const del = await sb.from("vacancies").delete().eq("id", vacancyId);
    if (del.error) {
      const msg = encodeURIComponent(del.error.message);
      return NextResponse.redirect(new URL(`/dashboard/admin/vacancies?error=${msg}`, url), 303);
    }
    return NextResponse.redirect(new URL(`/dashboard/admin/vacancies?deleted=${encodeURIComponent(vacancyId)}`, url), 303);
  }

  const title = safeTrim(form.get("title"));
  const slugRaw = safeTrim(form.get("slug"));
  const slug = slugRaw ? slugify(slugRaw) : null;

  const location = safeTrim(form.get("location")) || null;
  const type = safeTrim(form.get("type")) || null;
  const salary = safeTrim(form.get("salary")) || null;
  const body_mdx = safeTrim(form.get("body_mdx")) || "";

  const apply_url = normalizeUrl(form.get("apply_url"));
  const apply_email = normalizeEmail(form.get("apply_email"));
  const status = normalizeStatus(form.get("status"));
  const published_at = normalizePublishedAt(form.get("published_at"));

  const patch: Record<string, unknown> = {
    location,
    type,
    salary,
    body_mdx,
    apply_url,
    apply_email,
    status,
    published_at,
    updated_at: new Date().toISOString(),
  };
  if (title) patch.title = title;
  if (slug) patch.slug = slug;

  const upd = await sb.from("vacancies").update(patch).eq("id", vacancyId);
  if (upd.error) {
    const msg = encodeURIComponent(upd.error.message);
    return NextResponse.redirect(new URL(`/dashboard/admin/vacancies?error=${msg}`, url), 303);
  }

  return NextResponse.redirect(new URL(`/dashboard/admin/vacancies?updated=${encodeURIComponent(vacancyId)}`, url), 303);
}

