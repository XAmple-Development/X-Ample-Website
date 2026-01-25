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
  return {
    title: s ? `Vacancy · ${s}` : "Vacancy",
    description: "Vacancy at X-Ample Development.",
    openGraph: { url: `/vacancies/${encodeURIComponent(s)}` },
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
        className="text-sm text-foreground/70 underline underline-offset-4 decoration-black/25 hover:text-foreground dark:decoration-white/25"
      >
        Back to vacancies
      </Link>

      <h1 className="mt-4 text-pretty text-4xl font-semibold tracking-tight sm:text-5xl">{v.title}</h1>

      <div className="mt-4 flex flex-wrap gap-2 text-xs opacity-80">
        {v.location ? <span className="rounded-full border px-2 py-1">{v.location}</span> : null}
        {v.type ? <span className="rounded-full border px-2 py-1">{v.type}</span> : null}
        {v.salary ? <span className="rounded-full border px-2 py-1">{v.salary}</span> : null}
        <span className="rounded-full border px-2 py-1">{v.status === "closed" ? "Closed" : "Open"}</span>
      </div>

      <div className="prose prose-invert mt-8 max-w-none">{compiled.content}</div>

      <div className="mt-10 rounded-2xl border border-black/10 p-5 dark:border-white/10">
        <div className="text-sm font-semibold">Apply</div>
        {v.status === "closed" ? (
          <p className="mt-2 text-sm text-foreground/75">This role is currently closed.</p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {v.apply_url ? (
            <a className="rounded-lg bg-black px-3 py-2 text-sm text-white hover:opacity-90" href={v.apply_url} target="_blank" rel="noreferrer">
              Apply now
            </a>
          ) : null}
          {v.apply_email ? (
            <a className="rounded-lg border px-3 py-2 text-sm hover:bg-black/5" href={`mailto:${v.apply_email}`}>
              Email: {v.apply_email}
            </a>
          ) : null}
          {!v.apply_url && !v.apply_email ? (
            <Link className="rounded-lg border px-3 py-2 text-sm hover:bg-black/5" href="/support">
              Contact support
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mt-6 text-xs opacity-60">Last updated {new Date(v.updated_at).toLocaleString()}</div>
    </article>
  );
}

