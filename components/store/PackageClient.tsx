"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getIn, isRecord } from "@/lib/safe";

type TebexPackage = {
  id?: number | string;
  name?: string;
  description?: string;
  price?: unknown;
  base_price?: unknown;
  total_price?: unknown;
  image?: string;
};

function pickPackage(payload: unknown): TebexPackage | null {
  const maybe =
    getIn(payload, ["data"]) ??
    getIn(payload, ["package"]) ??
    getIn(payload, ["response", "package"]) ??
    payload;
  return isRecord(maybe) ? (maybe as TebexPackage) : null;
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

async function createBasket(): Promise<string> {
  const res = await fetch("/api/basket/create", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({}),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      (json && (json.error || json.message)) || `Request failed (${res.status})`,
    );
  }

  const ident =
    json?.ident ?? json?.data?.ident ?? json?.basket?.ident ?? json?.basketIdent;
  if (typeof ident !== "string" || ident.length === 0) {
    throw new Error("Basket created but ident was missing in the response.");
  }
  return ident;
}

async function addToBasket(ident: string, packageId: string) {
  const res = await fetch(`/api/basket/${encodeURIComponent(ident)}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ package_id: packageId, quantity: 1 }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      (json && (json.error || json.message)) || `Request failed (${res.status})`,
    );
  }
  return json;
}

export function PackageClient({ packageId }: { packageId: string }) {
  const [data, setData] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/store/packages/${packageId}`, {
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
  }, [packageId]);

  const pkg = useMemo(() => pickPackage(data), [data]);
  const price = pkg ? priceToText(pkg) : null;

  async function onAdd() {
    try {
      setAdding(true);
      setAddedMessage(null);
      setError(null);

      const key = "xa_basket_ident";
      const existing =
        typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
      const ident = existing && existing.length > 0 ? existing : await createBasket();
      if (!existing) window.localStorage.setItem(key, ident);

      await addToBasket(ident, String(pkg?.id ?? packageId));
      setAddedMessage("Added to cart.");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
        <div className="h-6 w-64 animate-pulse rounded bg-black/10 dark:bg-white/10" />
        <div className="mt-4 h-4 w-40 animate-pulse rounded bg-black/10 dark:bg-white/10" />
        <div className="mt-6 h-10 w-36 animate-pulse rounded-full bg-black/10 dark:bg-white/10" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5 text-sm text-red-200">
        <p className="font-semibold text-red-100">Couldn’t load package.</p>
        <p className="mt-2 text-red-100/80">{error}</p>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="rounded-2xl border border-black/10 p-5 text-sm text-foreground/75 dark:border-white/10">
        Package not found.{" "}
        <Link className="underline" href="/store">
          Back to store
        </Link>
        .
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-black/10 p-6 dark:border-white/10">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground/70">Package</p>
          <h1 className="mt-1 truncate text-3xl font-semibold tracking-tight">
            {pkg.name ?? "Package"}
          </h1>
          {price ? <p className="mt-2 text-foreground/75">{price}</p> : null}
        </div>
        <Link
          href="/store"
          className="inline-flex h-9 items-center justify-center rounded-full border border-black/15 px-4 text-sm font-medium transition-colors hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/[.06]"
        >
          Back
        </Link>
      </div>

      {pkg.description ? (
        <div className="mt-6 rounded-2xl bg-black/[.03] p-5 text-sm leading-7 text-foreground/80 dark:bg-white/[.06]">
          {pkg.description}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          disabled={adding}
          onClick={onAdd}
          className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:opacity-90 disabled:opacity-60"
        >
          {adding ? "Adding..." : "Add to cart"}
        </button>
        <Link
          href="/store/cart"
          className="inline-flex h-11 items-center justify-center rounded-full border border-black/15 px-6 text-sm font-medium transition-colors hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/[.06]"
        >
          View cart
        </Link>
        {addedMessage ? (
          <span className="text-sm text-foreground/70">{addedMessage}</span>
        ) : null}
      </div>
    </div>
  );
}

