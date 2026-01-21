import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/mdx/MDXComponents";
import { readPackageDocSource } from "@/lib/docs";
import { tebexAccountToken, tebexFetch } from "@/lib/tebex";

export const runtime = "nodejs";

type Money = { formatted?: string; value?: number; currency?: string };
type TebexPackage = { id: number; name?: string; total_price?: Money; price?: Money; base_price?: Money };

function asMoneyText(p?: Money | null) {
  if (!p) return "";
  if (typeof p.formatted === "string" && p.formatted.trim()) return p.formatted;
  if (typeof p.value === "number" && Number.isFinite(p.value)) {
    const currency =
      typeof p.currency === "string" && /^[A-Z]{3}$/i.test(p.currency.trim())
        ? p.currency.trim().toUpperCase()
        : "USD";
    try {
      return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(p.value / 100);
    } catch {
      return `$${(p.value / 100).toFixed(2)}`;
    }
  }
  return "";
}

export default async function PackageDocsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pid = id.trim();
  if (!pid) notFound();

  const source = await readPackageDocSource(pid);

  // Pull package name/price for the header (best-effort).
  let pkg: TebexPackage | null = null;
  try {
    const token = tebexAccountToken();
    const raw = await tebexFetch<any>(`/accounts/${encodeURIComponent(token)}/packages`, { method: "GET" });
    const arr: TebexPackage[] =
      (Array.isArray(raw?.data) ? raw.data : null) ??
      (Array.isArray(raw?.data?.packages) ? raw.data.packages : null) ??
      (Array.isArray(raw?.packages) ? raw.packages : null) ??
      [];
    pkg = arr.find((p) => String(p.id) === pid) ?? null;
  } catch {
    pkg = null;
  }

  const title = pkg?.name ?? `Package ${pid}`;
  const price = asMoneyText(pkg?.total_price ?? pkg?.price ?? pkg?.base_price ?? null);

  if (!source) {
    return (
      <div className="mx-auto max-w-3xl">
        <Link
          href="/docs"
          className="text-sm text-foreground/70 underline underline-offset-4 decoration-black/25 hover:text-foreground dark:decoration-white/25"
        >
          Back to docs
        </Link>

        <h1 className="mt-4 text-pretty text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
        {price ? <p className="mt-3 text-sm text-foreground/70">{price}</p> : null}

        <div className="mt-8 rounded-2xl border border-black/10 p-5 text-sm text-foreground/75 dark:border-white/10">
          Docs for this package aren’t available yet.
          <div className="mt-3 flex gap-2">
            <Link className="rounded-lg border px-3 py-2 text-sm hover:bg-black/5" href="/docs">
              View all docs
            </Link>
            <Link className="rounded-lg bg-black px-3 py-2 text-sm text-white hover:opacity-90" href={`/store/package/${pid}`}>
              Go to store page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const compiled = await compileMDX({
    source: source.content,
    components: mdxComponents,
  });

  return (
    <article className="mx-auto max-w-3xl">
      <Link
        href="/docs"
        className="text-sm text-foreground/70 underline underline-offset-4 decoration-black/25 hover:text-foreground dark:decoration-white/25"
      >
        Back to docs
      </Link>

      <h1 className="mt-4 text-pretty text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
      {price ? <p className="mt-3 text-sm text-foreground/70">{price}</p> : null}

      <div className="mt-8">{compiled.content}</div>
    </article>
  );
}

