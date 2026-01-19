"use client";

import { useEffect, useState } from "react";

type Money = { formatted?: string; value?: number; currency?: string };

function unwrapData<T>(payload: any): T {
  return (payload?.data ?? payload) as T;
}

function priceText(p?: Money) {
  if (!p) return "";
  if (p.formatted) return p.formatted;
  if (typeof p.value === "number") return `£${(p.value / 100).toFixed(2)}`;
  return "";
}

export default function PackageClient({ id }: { id: string }) {
  const [pkg, setPkg] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/store/package/${encodeURIComponent(id)}`, { cache: "no-store" });
        const json = await res.json().catch(() => null);

        if (!res.ok) throw new Error(json?.error ?? `Failed to load package (${res.status})`);

        if (!cancelled) setPkg(unwrapData(json));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load package");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <div className="text-sm opacity-60">Loading…</div>;
  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (!pkg) return <div className="text-sm opacity-60">Not found.</div>;

  const name = pkg?.name ?? "Package";
  const description = typeof pkg?.description === "string" ? pkg.description : "";
  const image = pkg?.image ?? pkg?.image_url ?? null;
  const total = pkg?.total_price ?? pkg?.price;

  return (
    <div className="rounded-xl border p-5">
      <a className="text-sm opacity-70 hover:underline" href="/store">
        ← Back to store
      </a>

      <div className="mt-3 text-2xl font-semibold">{name}</div>

      {image ? (
        <img
          src={image}
          alt={name}
          className="mt-4 w-full rounded-xl border object-cover"
        />
      ) : null}

      <div className="mt-4 text-lg font-semibold">{priceText(total)}</div>

      {description ? (
        <div
          className="prose prose-sm mt-4 max-w-none"
          // If you don’t trust HTML from Tebex, swap this for plain text.
          dangerouslySetInnerHTML={{ __html: description }}
        />
      ) : (
        <div className="mt-4 text-sm opacity-70">No description provided.</div>
      )}
    </div>
  );
}
