"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getIn, isRecord } from "@/lib/safe";

type BasketPackage = {
  id?: number | string;
  name?: string;
  quantity?: number;
  price?: unknown;
  total_price?: unknown;
  base_price?: unknown;
};

type TebexBasket = {
  ident?: string;
  packages?: BasketPackage[];
  links?: { checkout?: string };
  price?: unknown;
  base_price?: unknown;
  total_price?: unknown;
};

function pickBasket(payload: unknown): TebexBasket | null {
  const maybe =
    getIn(payload, ["data", "basket"]) ??
    getIn(payload, ["basket"]) ??
    getIn(payload, ["data"]) ??
    getIn(payload, ["response", "basket"]) ??
    payload;
  return isRecord(maybe) ? (maybe as TebexBasket) : null;
}

function priceToText(value: unknown): string | null {
  if (typeof value === "number") return `${value}`;
  if (typeof value === "string") return value;
  if (isRecord(value)) {
    const formatted = value.formatted;
    if (typeof formatted === "string") return formatted;
    const innerValue = value.value;
    if (typeof innerValue === "string") return innerValue;
    if (typeof innerValue === "number") return `${innerValue}`;
  }
  return null;
}

async function ensureBasketIdent(): Promise<string> {
  const key = "xa_basket_ident";
  const existing =
    typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
  if (existing && existing.length > 0) return existing;

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
  window.localStorage.setItem(key, ident);
  return ident;
}

export function CartClient() {
  const [ident, setIdent] = useState<string | null>(null);
  const [data, setData] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  const basket = useMemo(() => pickBasket(data), [data]);
  const packages = useMemo(
    () => (basket?.packages && Array.isArray(basket.packages) ? basket.packages : []),
    [basket],
  );

  async function refresh(basketIdent: string) {
    const res = await fetch(`/api/basket/${encodeURIComponent(basketIdent)}`, {
      headers: { Accept: "application/json" },
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(
        (json && (json.error || json.message)) || `Request failed (${res.status})`,
      );
    }
    setData(json);
    return json;
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const id = await ensureBasketIdent();
        if (cancelled) return;
        setIdent(id);
        await refresh(id);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function updateQuantity(packageId: string, quantity: number) {
    if (!ident) return;
    try {
      setWorking(true);
      setError(null);
      const res = await fetch(`/api/basket/${encodeURIComponent(ident)}/quantity`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ package_id: packageId, quantity }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          (json && (json.error || json.message)) ||
            `Request failed (${res.status})`,
        );
      }
      await refresh(ident);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setWorking(false);
    }
  }

  async function removeItem(packageId: string) {
    if (!ident) return;
    try {
      setWorking(true);
      setError(null);
      const res = await fetch(`/api/basket/${encodeURIComponent(ident)}/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ package_id: packageId }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          (json && (json.error || json.message)) ||
            `Request failed (${res.status})`,
        );
      }
      await refresh(ident);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setWorking(false);
    }
  }

  async function goToCheckout() {
    if (!ident) return;
    try {
      setWorking(true);
      setError(null);
      const json = await refresh(ident);
      const b = pickBasket(json);
      const checkout = b?.links?.checkout;
      if (!checkout || typeof checkout !== "string") {
        throw new Error(
          "Checkout link not available yet. Try again in a moment.",
        );
      }
      window.location.href = checkout;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setWorking(false);
    }
  }

  const total =
    basket?.total_price ?? basket?.price ?? basket?.base_price ?? null;
  const totalText = priceToText(total);

  if (loading) {
    return (
      <div className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
        <div className="h-4 w-40 animate-pulse rounded bg-black/10 dark:bg-white/10" />
        <div className="mt-4 h-10 w-full animate-pulse rounded-xl bg-black/10 dark:bg-white/10" />
        <div className="mt-2 h-10 w-full animate-pulse rounded-xl bg-black/10 dark:bg-white/10" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5 text-sm text-red-200">
        <p className="font-semibold text-red-100">Couldn’t load cart.</p>
        <p className="mt-2 text-red-100/80">{error}</p>
      </div>
    );
  }

  if (!packages.length) {
    return (
      <div className="rounded-2xl border border-black/10 p-5 text-sm text-foreground/75 dark:border-white/10">
        Your cart is empty.{" "}
        <Link className="underline" href="/store">
          Browse the store
        </Link>
        .
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
        <div className="flex flex-col gap-4">
          {packages.map((p, idx) => {
            const pid = String(p.id ?? idx);
            const qty = typeof p.quantity === "number" ? p.quantity : 1;
            const price =
              p.total_price ?? p.price ?? p.base_price ?? undefined;
            const priceText = priceToText(price);

            return (
              <div
                key={pid}
                className="flex flex-col justify-between gap-3 rounded-xl bg-black/[.03] p-4 dark:bg-white/[.06] sm:flex-row sm:items-center"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {p.name ?? "Package"}
                  </p>
                  {priceText ? (
                    <p className="mt-1 text-sm text-foreground/70">
                      {priceText}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={working || qty <= 1}
                    onClick={() => updateQuantity(pid, Math.max(1, qty - 1))}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-sm font-medium transition-colors hover:bg-black/[.04] disabled:opacity-50 dark:border-white/15 dark:hover:bg-white/[.06]"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="min-w-10 text-center text-sm font-medium">
                    {qty}
                  </span>
                  <button
                    type="button"
                    disabled={working}
                    onClick={() => updateQuantity(pid, qty + 1)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-sm font-medium transition-colors hover:bg-black/[.04] disabled:opacity-50 dark:border-white/15 dark:hover:bg-white/[.06]"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    disabled={working}
                    onClick={() => removeItem(pid)}
                    className="inline-flex h-9 items-center justify-center rounded-full border border-red-500/40 px-4 text-sm font-medium text-red-600 transition-colors hover:bg-red-500/10 disabled:opacity-50 dark:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-black/10 p-5 dark:border-white/10 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-foreground/70">Total</p>
          <p className="mt-1 text-xl font-semibold">
            {totalText ?? "—"}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/store"
            className="inline-flex h-11 items-center justify-center rounded-full border border-black/15 px-6 text-sm font-medium transition-colors hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/[.06]"
          >
            Continue shopping
          </Link>
          <button
            type="button"
            disabled={working}
            onClick={goToCheckout}
            className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:opacity-90 disabled:opacity-60"
          >
            {working ? "Working..." : "Checkout on Tebex"}
          </button>
        </div>
      </div>
    </div>
  );
}

