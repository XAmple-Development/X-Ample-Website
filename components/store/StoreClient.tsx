"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { asArray, getIn, isRecord } from "@/lib/safe";
import {
  addPackageToBasket,
  BasketRequestError,
  getStoredBasketIdent,
  redirectToBasketAuth,
} from "@/lib/basketClient";

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
  image?: string;
};

function pickCategories(payload: unknown): TebexCategory[] {
  const maybe =
    getIn(payload, ["data", "categories"]) ??
    getIn(payload, ["data"]) ??
    getIn(payload, ["categories"]) ??
    getIn(payload, ["response", "categories"]) ??
    payload;
  return asArray(maybe) as TebexCategory[];
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

export function StoreClient() {
  const [data, setData] = useState<unknown>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const res = await fetch("/api/store/categories", {
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
        if (!cancelled)
          setLoadError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => pickCategories(data), [data]);

  function isAuthRequiredMessage(message: string): boolean {
    return /auth|authenticate|login|log in|username/i.test(message);
  }

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5 text-sm text-red-200">
        <p className="font-semibold text-red-100">Couldn’t load the store.</p>
        <p className="mt-2 text-red-100/80">{loadError}</p>
        <p className="mt-3 text-red-100/70">
          If this is a deployed site, check Netlify env vars for{" "}
          <span className="font-medium">TEBEX_WEBSTORE_TOKEN</span>,{" "}
          <span className="font-medium">TEBEX_PUBLIC_TOKEN</span>,{" "}
          <span className="font-medium">TEBEX_PRIVATE_KEY</span>.
        </p>
      </div>
    );
  }

  if (!categories.length) {
    return (
      <div className="rounded-2xl border border-black/10 p-5 text-sm text-foreground/75 dark:border-white/10">
        No categories found.
      </div>
    );
  }

  return (
    <div>
      {actionError ? (
        <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-200">
          <p className="font-semibold text-red-100">Couldn’t add to cart.</p>
          <p className="mt-1 text-red-100/80">{actionError}</p>
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
      {categories.map((c, idx) => {
        const id = c?.id ?? c?.category_id ?? idx;
        const name = c?.name ?? "Category";
        const packages = Array.isArray(c?.packages) ? c.packages : [];

        return (
          <div
            key={String(id)}
            className="rounded-2xl border border-black/10 p-5 dark:border-white/10"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">{name}</p>
                <p className="mt-1 text-sm text-foreground/70">
                  {packages.length} package{packages.length === 1 ? "" : "s"}
                </p>
              </div>
              <Link
                href={`/store/category/${encodeURIComponent(String(id))}`}
                className="inline-flex h-9 items-center justify-center rounded-full border border-black/15 px-4 text-sm font-medium transition-colors hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/[.06]"
              >
                View
              </Link>
            </div>

            {packages.length > 0 ? (
              <div className="mt-4 space-y-2">
                {packages.slice(0, 3).map((p) => {
                  const pid = p?.id;
                  const pname = p?.name ?? "Package";
                  const price = priceToText(p);
                  const pidText =
                    pid === undefined || pid === null ? null : String(pid);
                  return (
                    <div
                      key={String(pid ?? pname)}
                      className="flex items-center justify-between gap-4 rounded-xl bg-black/[.03] px-3 py-2 text-sm dark:bg-white/[.06]"
                    >
                      <div className="min-w-0">
                        {pidText ? (
                          <Link
                            href={`/store/package/${encodeURIComponent(pidText)}`}
                            className="truncate font-medium"
                          >
                            {pname}
                          </Link>
                        ) : (
                          <span className="truncate font-medium">{pname}</span>
                        )}
                        {price ? (
                          <div className="mt-0.5 text-xs text-foreground/70">
                            {price}
                          </div>
                        ) : null}
                      </div>
                      {pidText ? (
                        <button
                          type="button"
                          disabled={addingId === pidText}
                          onClick={async () => {
                            try {
                              setAddingId(pidText);
                              setAddedId(null);
                              setActionError(null);
                              await addPackageToBasket({ packageId: pidText, quantity: 1 });
                              setAddedId(pidText);
                              // Clear the "Added" state after a moment.
                              window.setTimeout(() => setAddedId(null), 1500);
                            } catch (e) {
                              const message = e instanceof Error ? e.message : String(e);
                              setActionError(message);

                              const ident =
                                e instanceof BasketRequestError
                                  ? e.ident ?? getStoredBasketIdent()
                                  : getStoredBasketIdent();

                              if (ident && isAuthRequiredMessage(message)) {
                                await redirectToBasketAuth({
                                  ident,
                                  returnUrl: window.location.href,
                                });
                              }
                            } finally {
                              setAddingId(null);
                            }
                          }}
                          className="inline-flex h-9 shrink-0 items-center justify-center rounded-full border border-black/15 px-4 text-xs font-medium transition-colors hover:bg-black/[.04] disabled:opacity-60 dark:border-white/15 dark:hover:bg-white/[.06]"
                        >
                          {addedId === pidText
                            ? "Added"
                            : addingId === pidText
                              ? "Adding..."
                              : "Add"}
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
      <div className="h-4 w-40 animate-pulse rounded bg-black/10 dark:bg-white/10" />
      <div className="mt-3 h-3 w-24 animate-pulse rounded bg-black/10 dark:bg-white/10" />
      <div className="mt-6 space-y-2">
        <div className="h-9 w-full animate-pulse rounded-xl bg-black/10 dark:bg-white/10" />
        <div className="h-9 w-full animate-pulse rounded-xl bg-black/10 dark:bg-white/10" />
      </div>
    </div>
  );
}

