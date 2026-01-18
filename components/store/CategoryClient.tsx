"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { isRecord } from "@/lib/safe";

type TebexCategory = {
  id?: number | string;
  category_id?: number | string;
  name?: string;
  packages?: TebexPackage[];
};

type TebexPackage = {
  id?: number | string;
  name?: string;
  price?: unknown;
  base_price?: unknown;
  total_price?: unknown;
};

function pickCategory(payload: unknown): TebexCategory | null {
  // Tebex can return { data: {...} } for category endpoints.
  if (!payload || typeof payload !== "object") return null;
  const data = (payload as { data?: unknown }).data ?? payload;
  if (Array.isArray(data)) {
    const first = data[0];
    return isRecord(first) ? (first as TebexCategory) : null;
  }
  return isRecord(data) ? (data as TebexCategory) : null;
}

function priceToText(pkg: TebexPackage): string | null {
  const candidate = pkg.total_price ?? pkg.base_price ?? pkg.price;
  if (typeof candidate === "number") return `${candidate}`;
  if (typeof candidate === "string") return candidate;
  if (isRecord(candidate)) {
    const formatted = candidate.formatted;
    if (typeof formatted === "string") return formatted;
    const value = candidate.value;
    if (typeof value === "string") return value;
    if (typeof value === "number") return `${value}`;
  }
  return null;
}

export function CategoryClient({ categoryId }: { categoryId: string }) {
  const [data, setData] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/store/categories/${categoryId}`, {
          headers: { Accept: "application/json" },
        });
        const json = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(
            (json && (json.error || json.message)) ||
              `Request failed (${res.status})`,
          );
        }
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  const category = useMemo(() => pickCategory(data), [data]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
        <div className="h-5 w-56 animate-pulse rounded bg-black/10 dark:bg-white/10" />
        <div className="mt-4 h-10 w-full animate-pulse rounded-xl bg-black/10 dark:bg-white/10" />
        <div className="mt-2 h-10 w-full animate-pulse rounded-xl bg-black/10 dark:bg-white/10" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5 text-sm text-red-200">
        <p className="font-semibold text-red-100">Couldn’t load category.</p>
        <p className="mt-2 text-red-100/80">{error}</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="rounded-2xl border border-black/10 p-5 text-sm text-foreground/75 dark:border-white/10">
        Category not found.{" "}
        <Link className="underline" href="/store">
          Back to store
        </Link>
        .
      </div>
    );
  }

  const packages = Array.isArray(category.packages) ? category.packages : [];

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-foreground/70">Category</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {category.name ?? "Category"}
          </h1>
          <p className="mt-2 text-foreground/75">
            {packages.length} package{packages.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href="/store"
          className="inline-flex h-9 items-center justify-center rounded-full border border-black/15 px-4 text-sm font-medium transition-colors hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/[.06]"
        >
          Back
        </Link>
      </div>

      <div className="mt-8 grid gap-3">
        {packages.map((p, idx) => {
          const id = p?.id;
          if (id === undefined || id === null) return null;
          const price = priceToText(p);
          return (
            <div
              key={String(id ?? idx)}
              className="flex flex-col justify-between gap-3 rounded-2xl border border-black/10 p-5 dark:border-white/10 sm:flex-row sm:items-center"
            >
              <div className="min-w-0">
                <Link
                  href={`/store/package/${encodeURIComponent(String(id))}`}
                  className="truncate text-sm font-semibold"
                >
                  {p?.name ?? "Package"}
                </Link>
                {price ? (
                  <p className="mt-1 text-sm text-foreground/70">{price}</p>
                ) : null}
              </div>
              <Link
                href={`/store/package/${encodeURIComponent(String(id))}`}
                className="inline-flex h-9 items-center justify-center rounded-full bg-foreground px-4 text-sm font-medium text-background transition-colors hover:opacity-90"
              >
                View details
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

