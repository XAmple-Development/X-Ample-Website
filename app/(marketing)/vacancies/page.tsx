import type { Metadata } from "next";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const vacanciesDescription =
  "Open roles and careers at X-Ample Development. Join the team building Discord bots, websites, and custom development.";

export const metadata: Metadata = {
  title: "Vacancies",
  description: vacanciesDescription,
  alternates: { canonical: "/vacancies" },
  openGraph: {
    title: "Vacancies · X-Ample Development",
    description: vacanciesDescription,
    type: "website",
    url: "/vacancies",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vacancies · X-Ample Development",
    description: vacanciesDescription,
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
    <div className="space-y-10">
      <PageHeader
        kicker="Careers"
        title="Vacancies"
        description="We're always looking for talented people to help us build Discord bots, websites, and great web experiences."
      />

      {rows.length ? (
        <div className="grid gap-3">
          {rows.map((v) => (
            <div key={v.id} className="rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent/30">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/vacancies/${encodeURIComponent(v.slug)}`}
                    className="block truncate text-sm font-semibold hover:text-accent"
                  >
                    {v.title}
                  </Link>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
                    {v.location ? <span className="rounded-full border border-border px-2 py-1">{v.location}</span> : null}
                    {v.type ? <span className="rounded-full border border-border px-2 py-1">{v.type}</span> : null}
                    {v.salary ? <span className="rounded-full border border-border px-2 py-1">{v.salary}</span> : null}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="hidden text-xs text-muted sm:block">
                    Updated {new Date(v.updated_at).toLocaleDateString()}
                  </div>
                  <Button href={`/vacancies/${encodeURIComponent(v.slug)}`} variant="primary" className="h-9 px-4 text-xs">
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-surface p-5 text-sm text-muted">
          No open roles right now. Check back soon, or reach out via{" "}
          <Link href="/support" className="text-accent hover:text-accent-hover">
            Support
          </Link>
          .
        </div>
      )}

      {closed.length ? (
        <details className="rounded-2xl border border-border bg-surface p-5">
          <summary className="cursor-pointer text-sm font-semibold">Closed roles</summary>
          <div className="mt-4 grid gap-2">
            {closed.map((v) => (
              <Link
                key={v.id}
                href={`/vacancies/${encodeURIComponent(v.slug)}`}
                className="flex flex-wrap items-baseline justify-between gap-3 rounded-xl border border-border p-4 text-sm transition-colors hover:border-accent/30 hover:bg-accent-muted"
              >
                <span className="font-medium">{v.title}</span>
                <span className="text-xs text-muted">Closed</span>
              </Link>
            ))}
          </div>
        </details>
      ) : null}
    </div>
  );
}
