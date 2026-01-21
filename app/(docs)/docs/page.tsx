import Link from "next/link";
import { listPackageDocMetas } from "@/lib/docs";
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

function extractPackages(payload: any): TebexPackage[] {
  if (!payload) return [];
  if (Array.isArray(payload?.data)) return payload.data as TebexPackage[];
  if (Array.isArray(payload?.data?.packages)) return payload.data.packages as TebexPackage[];
  if (Array.isArray(payload?.packages)) return payload.packages as TebexPackage[];
  if (Array.isArray(payload)) return payload as TebexPackage[];
  return [];
}

export default async function DocsIndexPage() {
  const metas = await listPackageDocMetas();
  const metaById = new Map(metas.map((m) => [m.id, m]));

  let packages: TebexPackage[] = [];
  try {
    const token = tebexAccountToken();
    const raw = await tebexFetch<any>(`/accounts/${encodeURIComponent(token)}/packages`, { method: "GET" });
    packages = extractPackages(raw);
  } catch {
    // If env vars aren't set locally, show placeholder state.
    packages = [];
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-semibold tracking-tight">Docs</h1>
      <p className="mt-4 text-lg leading-8 text-foreground/75">
        Installation guides, configuration notes, and troubleshooting for each package.
      </p>

      {packages.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-black/10 p-5 text-sm text-foreground/75 dark:border-white/10">
          Packages couldn’t be loaded here (missing Tebex env vars or API error). If you’re running locally, ensure
          Tebex environment variables are set.
        </div>
      ) : (
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {packages.map((p) => {
            const id = String(p.id);
            const meta = metaById.get(id);
            const price = asMoneyText(p.total_price ?? p.price ?? p.base_price ?? null);

            return (
              <div key={id} className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="min-w-0 truncate text-sm font-semibold">{p.name ?? `Package ${id}`}</div>
                  <div className="shrink-0 text-xs opacity-70">{price || `ID: ${id}`}</div>
                </div>

                {meta?.summary ? <div className="mt-2 text-sm opacity-80">{meta.summary}</div> : null}
                {!meta?.summary ? <div className="mt-2 text-sm opacity-70">Docs coming soon.</div> : null}

                <div className="mt-4 flex gap-2">
                  <Link
                    className="flex-1 rounded-lg border px-3 py-2 text-center text-sm hover:bg-black/5"
                    href={`/docs/package/${id}`}
                  >
                    View docs
                  </Link>
                  <Link
                    className="flex-1 rounded-lg bg-black px-3 py-2 text-center text-sm text-white hover:opacity-90"
                    href={`/store/package/${id}`}
                  >
                    Store page
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

