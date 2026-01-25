import Link from "next/link";
import { getSessionFromCookies } from "@/lib/session";
import { isAdminForSession } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase";
import type { VacancyRow } from "@/lib/vacancies";

export const runtime = "nodejs";

export default async function AdminVacanciesPage() {
  const session = await getSessionFromCookies();
  if (!session) return null;

  const isAdmin = await isAdminForSession(session);
  if (!isAdmin) {
    return (
      <div className="rounded-xl border p-5">
        <h1 className="text-xl font-semibold">Vacancies</h1>
        <p className="mt-2 text-sm opacity-75">You don’t have access to this page.</p>
      </div>
    );
  }

  const sb = supabaseAdmin();
  const { data } = await sb
    .from("vacancies")
    .select("id, slug, title, location, type, salary, body_mdx, apply_url, apply_email, status, published_at, created_at, updated_at")
    .order("updated_at", { ascending: false })
    .limit(100);

  const vacancies = (data ?? []) as VacancyRow[];

  return (
    <div className="rounded-xl border p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Vacancies</h1>
          <p className="mt-2 text-sm opacity-75">Create and update vacancies (live, no redeploy).</p>
        </div>
        <div className="flex gap-2">
          <Link className="rounded-lg border px-3 py-2 text-sm hover:bg-black/5" href="/vacancies">
            View public page
          </Link>
          <Link className="rounded-lg border px-3 py-2 text-sm hover:bg-black/5" href="/dashboard/admin">
            Back to admin
          </Link>
        </div>
      </div>

      <div className="mt-6 rounded-xl border p-4">
        <div className="text-sm font-semibold">Create vacancy</div>
        <form className="mt-3 grid gap-3" action="/api/dashboard/admin/vacancies" method="post">
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Title">
              <input name="title" className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Senior FiveM Developer" required />
            </Field>
            <Field label="Slug (optional)">
              <input name="slug" className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="senior-fivem-developer" />
            </Field>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <Field label="Location">
              <input name="location" className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Remote / UK" />
            </Field>
            <Field label="Type">
              <input name="type" className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Contract / Full-time" />
            </Field>
            <Field label="Salary (optional)">
              <input name="salary" className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="$X / month" />
            </Field>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Apply URL (optional)">
              <input name="apply_url" className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="https://…" />
            </Field>
            <Field label="Apply email (optional)">
              <input name="apply_email" className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="info@x-ampledevelopment.co.uk" />
            </Field>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Status">
              <select name="status" className="w-full rounded-lg border px-3 py-2 text-sm" defaultValue="draft">
                <option value="draft">draft</option>
                <option value="open">open</option>
                <option value="closed">closed</option>
              </select>
            </Field>
            <Field label="Publish date">
              <div className="rounded-lg border px-3 py-2 text-sm opacity-70">Auto-set when status becomes open.</div>
            </Field>
          </div>

          <Field label="Body (MDX/Markdown)">
            <textarea
              name="body_mdx"
              className="min-h-[160px] w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="## Overview\n\nWrite the role description here…"
            />
          </Field>

          <button className="w-fit rounded-lg bg-black px-3 py-2 text-sm text-white hover:opacity-90" type="submit">
            Create
          </button>
        </form>
      </div>

      <div className="mt-6">
        <div className="text-sm font-semibold">Existing vacancies</div>
        {vacancies.length ? (
          <div className="mt-3 space-y-3">
            {vacancies.map((v) => (
              <details key={v.id} className="rounded-xl border p-4">
                <summary className="cursor-pointer list-none">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <div className="min-w-0 truncate text-sm font-semibold">{v.title}</div>
                    <div className="text-xs opacity-70">
                      {v.status}
                      {v.published_at ? ` · published ${new Date(v.published_at).toLocaleDateString()}` : " · not published"}
                    </div>
                  </div>
                  <div className="mt-1 text-xs opacity-60">/{v.slug} · updated {new Date(v.updated_at).toLocaleString()}</div>
                </summary>

                <div className="mt-4 grid gap-3">
                  <div className="flex flex-wrap gap-2">
                    <Link className="rounded-lg border px-3 py-2 text-sm hover:bg-black/5" href={`/vacancies/${encodeURIComponent(v.slug)}`}>
                      View public (if published)
                    </Link>
                    <form action={`/api/dashboard/admin/vacancies/${encodeURIComponent(v.id)}`} method="post">
                      <input type="hidden" name="action" value="delete" />
                      <button className="rounded-lg border px-3 py-2 text-sm hover:bg-black/5" type="submit">
                        Delete
                      </button>
                    </form>
                  </div>

                  <form className="grid gap-3" action={`/api/dashboard/admin/vacancies/${encodeURIComponent(v.id)}`} method="post">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Field label="Title">
                        <input name="title" className="w-full rounded-lg border px-3 py-2 text-sm" defaultValue={v.title} />
                      </Field>
                      <Field label="Slug">
                        <input name="slug" className="w-full rounded-lg border px-3 py-2 text-sm" defaultValue={v.slug} />
                      </Field>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-3">
                      <Field label="Location">
                        <input name="location" className="w-full rounded-lg border px-3 py-2 text-sm" defaultValue={v.location ?? ""} />
                      </Field>
                      <Field label="Type">
                        <input name="type" className="w-full rounded-lg border px-3 py-2 text-sm" defaultValue={v.type ?? ""} />
                      </Field>
                      <Field label="Salary">
                        <input name="salary" className="w-full rounded-lg border px-3 py-2 text-sm" defaultValue={v.salary ?? ""} />
                      </Field>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <Field label="Apply URL">
                        <input name="apply_url" className="w-full rounded-lg border px-3 py-2 text-sm" defaultValue={v.apply_url ?? ""} />
                      </Field>
                      <Field label="Apply email">
                        <input name="apply_email" className="w-full rounded-lg border px-3 py-2 text-sm" defaultValue={v.apply_email ?? ""} />
                      </Field>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <Field label="Status">
                        <select name="status" className="w-full rounded-lg border px-3 py-2 text-sm" defaultValue={v.status}>
                          <option value="draft">draft</option>
                          <option value="open">open</option>
                          <option value="closed">closed</option>
                        </select>
                      </Field>
                      <Field label="Published">
                        <div className="rounded-lg border px-3 py-2 text-sm opacity-70">
                          {v.published_at ? new Date(v.published_at).toLocaleString() : "Not published yet (auto-set when opened)."}
                        </div>
                      </Field>
                    </div>

                    <Field label="Body (MDX/Markdown)">
                      <textarea
                        name="body_mdx"
                        className="min-h-[160px] w-full rounded-lg border px-3 py-2 text-sm"
                        defaultValue={v.body_mdx}
                      />
                    </Field>

                    <button className="w-fit rounded-lg bg-black px-3 py-2 text-sm text-white hover:opacity-90" type="submit">
                      Save
                    </button>
                  </form>
                </div>
              </details>
            ))}
          </div>
        ) : (
          <div className="mt-3 text-sm opacity-70">No vacancies yet.</div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="text-xs font-medium opacity-80">{label}</span>
      {children}
    </label>
  );
}

