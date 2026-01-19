"use client";

import { useEffect, useState } from "react";

export default function PackageClient({ id }: { id?: string }) {
  const [pkg, setPkg] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const safeId = (id ?? "").trim();

    // Guard: NEVER fetch if id is missing/invalid
    if (!safeId || safeId === "undefined" || safeId === "null") {
      setError("Missing package id in URL (check your /store links).");
      setPkg(null);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/store/package/${encodeURIComponent(safeId)}`, {
          cache: "no-store",
        });

        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.error ?? `Failed to load package (${res.status})`);

        if (!cancelled) setPkg(json?.data ?? json);
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

      {description ? (
        <div className="mt-4 whitespace-pre-wrap text-sm opacity-90">
          {description.replace(/<[^>]*>/g, "")}
        </div>
      ) : (
        <div className="mt-4 text-sm opacity-70">No description provided.</div>
      )}
    </div>
  );
}
