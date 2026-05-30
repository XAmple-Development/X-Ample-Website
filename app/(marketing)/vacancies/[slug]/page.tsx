import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/mdx/MDXComponents";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = slug.trim();
  const path = `/vacancies/${encodeURIComponent(s)}`;
  const desc = s
    ? `Vacancy: ${s} at X-Ample Development. View role details and how to apply.`
    : "Vacancy at X-Ample Development.";
  return {
    title: s ? s : "Vacancy",
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      title: s ? `${s} · Vacancies · X-Ample Development` : "Vacancy · X-Ample Development",
      description: desc,
      type: "website",
      url: path,
    },
    twitter: {
      card: "summary_large_image",
      title: s ? `${s} · X-Ample Development` : "Vacancy · X-Ample Development",
      description: desc,
    },
  };
}

type VacancyRow = {
  id: string;
  slug: string;
  title: string;
  location: string | null;
  type: string | null;
  salary: string | null;
  body_mdx: string;
  apply_url: string | null;
  apply_email: string | null;
  status: string;
  published_at: string | null;
  updated_at: string;
};

export default async function VacancyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = slug.trim();
  if (!s) notFound();

  const sb = supabaseAdmin();
  const { data } = await sb
    .from("vacancies")
    .select("id, slug, title, location, type, salary, body_mdx, apply_url, apply_email, status, published_at, updated_at")
    .eq("slug", s)
    .maybeSingle();

  const v = data as VacancyRow | null;
  if (!v) notFound();

  // Public-only: require published and not draft.
  if (!v.published_at || v.status === "draft") notFound();
  if (new Date(v.published_at).getTime() > Date.now()) notFound();

  const compiled = await compileMDX({
    source: v.body_mdx || "",
    components: mdxComponents,
  });

  return (
    <article className="mx-auto max-w-3xl">
      <Link
        href="/vacancies"
        className="text-sm text-muted underline underline-offset-4 decoration-border-strong hover:text-accent hover:decoration-accent"
      >
        Back to vacancies
      </Link>

      <h1 className="mt-4 text-pretty text-4xl font-semibold tracking-tight sm:text-5xl">{v.title}</h1>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
        {v.location ? <span className="rounded-full border border-border px-2 py-1">{v.location}</span> : null}
        {v.type ? <span className="rounded-full border border-border px-2 py-1">{v.type}</span> : null}
        {v.salary ? <span className="rounded-full border border-border px-2 py-1">{v.salary}</span> : null}
        <span className="rounded-full border border-border px-2 py-1">{v.status === "closed" ? "Closed" : "Open"}</span>
      </div>

      <div className="prose prose-invert mt-8 max-w-none">{compiled.content}</div>

      <div className="mt-10 rounded-2xl border border-border bg-surface p-5">
        <div className="text-sm font-semibold">Apply</div>
        {v.status === "closed" ? (
          <p className="mt-2 text-sm text-muted">This role is currently closed.</p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {v.apply_url ? (
            <a className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-medium text-white hover:bg-accent-hover" href={v.apply_url} target="_blank" rel="noreferrer">
              Apply now
            </a>
          ) : null}
          {v.apply_email ? (
            <a className="inline-flex h-11 items-center justify-center rounded-full border border-border-strong px-6 text-sm font-medium hover:border-accent/50 hover:bg-accent-muted" href={`mailto:${v.apply_email}`}>
              Email: {v.apply_email}
            </a>
          ) : null}
          {!v.apply_url && !v.apply_email ? (
            <Link className="inline-flex h-11 items-center justify-center rounded-full border border-border-strong px-6 text-sm font-medium hover:border-accent/50 hover:bg-accent-muted" href="/support">
              Contact support
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mt-6 text-xs text-muted">Last updated {new Date(v.updated_at).toLocaleString()}</div>
    </article>
  );
}

