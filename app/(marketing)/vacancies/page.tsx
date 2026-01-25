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

  const { data } = await sb
    .from("vacancies")
    .select("id, slug, title, location, type, salary, status, published_at, updated_at")
    .eq("status", "open")
    .not("published_at", "is", null)
    .lte("published_at", now)
    .order("published_at", { ascending: false })
    .limit(50);

  const rows = (data ?? []) as VacancyListRow[];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-semibold tracking-tight">Vacancies</h1>
      <p className="mt-4 text-lg leading-8 text-foreground/75">
        We’re always looking for talented people to help build premium FiveM experiences.
      </p>

      {rows.length ? (
        <div className="mt-8 grid gap-3">
          {rows.map((v) => (
            <Link
              key={v.id}
              href={`/vacancies/${encodeURIComponent(v.slug)}`}
              className="rounded-2xl border border-black/10 p-5 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div className="text-sm font-semibold">{v.title}</div>
                <div className="text-xs opacity-70">{new Date(v.updated_at).toLocaleDateString()}</div>
              </div>

              <div className="mt-2 flex flex-wrap gap-2 text-xs opacity-80">
                {v.location ? <span className="rounded-full border px-2 py-1">{v.location}</span> : null}
                {v.type ? <span className="rounded-full border px-2 py-1">{v.type}</span> : null}
                {v.salary ? <span className="rounded-full border px-2 py-1">{v.salary}</span> : null}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-black/10 p-5 text-sm text-foreground/75 dark:border-white/10">
          No open roles right now. Check back soon, or reach out via <Link href="/support" className="underline">Support</Link>.
        </div>
      )}
    </div>
  );
}

