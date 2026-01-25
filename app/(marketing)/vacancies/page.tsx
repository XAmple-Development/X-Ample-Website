import type { Metadata } from "next";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vacancies",
  description: "Open roles at X-Ample Development.",
  openGraph: {
    title: "Vacancies · X-Ample Development",
    description: "Open roles at X-Ample Development.",
    url: "/vacancies",
  },
  twitter: {
    card: "summary",
    title: "Vacancies · X-Ample Development",
    description: "Open roles at X-Ample Development.",
  },
};

type VacancyListRow = {
  id: string;
  slug: string;
  title: string;
  location: string | null;
  type: string | null;
  salary: string | null;
  status: string;
  published_at: string | null;
  updated_at: string;
};

export default async function VacanciesPage() {
  const sb = supabaseAdmin();
  const now = new Date().toISOString();

  const { data: openData } = await sb
    .from("vacancies")
    .select("id, slug, title, location, type, salary, status, published_at, updated_at")
    .eq("status", "open")
    .not("published_at", "is", null)
    .lte("published_at", now)
    .order("published_at", { ascending: false })
    .limit(50);

  const { data: closedData } = await sb
    .from("vacancies")
    .select("id, slug, title, location, type, salary, status, published_at, updated_at")
    .eq("status", "closed")
    .not("published_at", "is", null)
    .lte("published_at", now)
    .order("published_at", { ascending: false })
    .limit(50);

  const rows = (openData ?? []) as VacancyListRow[];
  const closed = (closedData ?? []) as VacancyListRow[];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-semibold tracking-tight">Vacancies</h1>
      <p className="mt-4 text-lg leading-8 text-foreground/75">
        We’re always looking for talented people to help us build the future of Development.
      </p>

      {rows.length ? (
        <div className="mt-8 grid gap-3">
          {rows.map((v) => (
            <div key={v.id} className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/vacancies/${encodeURIComponent(v.slug)}`}
                    className="block truncate text-sm font-semibold hover:underline"
                  >
                    {v.title}
                  </Link>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs opacity-80">
                    {v.location ? <span className="rounded-full border px-2 py-1">{v.location}</span> : null}
                    {v.type ? <span className="rounded-full border px-2 py-1">{v.type}</span> : null}
                    {v.salary ? <span className="rounded-full border px-2 py-1">{v.salary}</span> : null}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="hidden sm:block text-xs opacity-70">
                    Updated {new Date(v.updated_at).toLocaleDateString()}
                  </div>
                  <Link
                    href={`/vacancies/${encodeURIComponent(v.slug)}`}
                    className="rounded-lg bg-black px-3 py-2 text-sm text-white hover:opacity-90"
                  >
                    Apply
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-black/10 p-5 text-sm text-foreground/75 dark:border-white/10">
          No open roles right now. Check back soon, or reach out via <Link href="/support" className="underline">Support</Link>.
        </div>
      )}

      {closed.length ? (
        <details className="mt-8 rounded-2xl border border-black/10 p-5 dark:border-white/10">
          <summary className="cursor-pointer text-sm font-semibold">Closed roles</summary>
          <div className="mt-4 grid gap-2">
            {closed.map((v) => (
              <Link
                key={v.id}
                href={`/vacancies/${encodeURIComponent(v.slug)}`}
                className="flex flex-wrap items-baseline justify-between gap-3 rounded-xl border border-black/10 p-4 text-sm hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
              >
                <span className="font-medium">{v.title}</span>
                <span className="text-xs opacity-70">Closed</span>
              </Link>
            ))}
          </div>
        </details>
      ) : null}
    </div>
  );
}

