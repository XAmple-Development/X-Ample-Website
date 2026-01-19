"use client";

import { useEffect, useMemo, useState } from "react";

type Money = { formatted?: string; value?: number; currency?: string };
type Package = { id: number; name: string; description?: string; image?: string; price?: Money; total_price?: Money };
type Category = { id: number; name: string; packages?: Package[] };

// Tebex often wraps responses, so we unwrap loosely.
function unwrapData<T>(payload: any): T {
  return (payload?.data ?? payload) as T;
}

function priceText(p?: Money) {
  if (!p) return "";
  if (p.formatted) return p.formatted;
  if (typeof p.value === "number") return `£${(p.value / 100).toFixed(2)}`;
  return "";
}

const LS_KEY = "tebex_basket_ident";

export default function StoreClient() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

  const [basketIdent, setBasketIdent] = useState<string | null>(null);
  const [basket, setBasket] = useState<any>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load categories
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/store/categories?includePackages=1", { cache: "no-store" });
        const json = await res.json();
        const cats = unwrapData<Category[]>(json) ?? [];
        if (!cancelled) {
          setCategories(cats);
          setActiveCategoryId(cats[0]?.id ?? null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load store");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Restore basket ident from localStorage
  useEffect(() => {
    const ident = localStorage.getItem(LS_KEY);
    if (ident) setBasketIdent(ident);
  }, []);

  // Fetch basket when we have ident
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!basketIdent) return;
      try {
        const res = await fetch(`/api/basket/${encodeURIComponent(basketIdent)}`, { cache: "no-store" });
        const json = await res.json();
        if (!cancelled) setBasket(json);
      } catch {
        // if basket invalid/expired, wipe it
        localStorage.removeItem(LS_KEY);
        if (!cancelled) setBasketIdent(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [basketIdent]);

  const activeCategory = useMemo(
    () => categories.find((c) => c.id === activeCategoryId) ?? null,
    [categories, activeCategoryId],
  );

  async function ensureBasket() {
    if (basketIdent) return basketIdent;

    setBusy("basket");
    setError(null);
    try {
      const res = await fetch("/api/basket", { method: "POST" });
      const json = await res.json();

      // Tebex usually returns something containing ident; try common paths.
      const ident =
        json?.data?.ident ??
        json?.data?.basket?.ident ??
        json?.ident ??
        json?.basket?.ident;

      if (!ident || typeof ident !== "string") throw new Error("Basket created but ident was missing");

      localStorage.setItem(LS_KEY, ident);
      setBasketIdent(ident);
      return ident;
    } finally {
      setBusy(null);
    }
  }

  async function startAuth() {
    const ident = await ensureBasket();
    setBusy("auth");
    setError(null);
    try {
      const res = await fetch(`/api/basket/auth?ident=${encodeURIComponent(ident)}`, { cache: "no-store" });
      const json = await res.json();

      // Tebex auth response contains a URL (varies); try common paths:
      const authUrl =
        json?.data?.url ??
        json?.data?.authUrl ??
        json?.url ??
        json?.authUrl ??
        json?.data?.links?.auth ??
        json?.links?.auth;

      if (!authUrl || typeof authUrl !== "string") {
        throw new Error("Auth URL not found in response");
      }

      window.location.href = authUrl;
    } finally {
      setBusy(null);
    }
  }

  async function addToBasket(pkg: Package) {
    const ident = await ensureBasket();
    setBusy(`add:${pkg.id}`);
    setError(null);
    try {
      const res = await fetch(`/api/basket/${encodeURIComponent(ident)}/packages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkg.id, quantity: 1 }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to add package");

      // Refresh basket after add
      const b = await fetch(`/api/basket/${encodeURIComponent(ident)}`, { cache: "no-store" }).then((r) => r.json());
      setBasket(b);
    } finally {
      setBusy(null);
    }
  }

  const checkoutUrl =
    basket?.data?.links?.checkout ??
    basket?.links?.checkout ??
    basket?.data?.checkout_url ??
    basket?.checkout_url;

  return (
    <div className="grid gap-6 md:grid-cols-[260px_1fr]">
      <aside className="rounded-xl border p-4">
        <div className="text-sm font-medium">Categories</div>

        {loading ? (
          <div className="mt-3 space-y-2 text-sm opacity-60">Loading…</div>
        ) : (
          <div className="mt-3 space-y-1">
            {categories.map((c) => (
              <button
                key={c.id}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                  c.id === activeCategoryId ? "bg-black text-white" : "hover:bg-black/5"
                }`}
                onClick={() => setActiveCategoryId(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        <div className="mt-6 border-t pt-4">
          <div className="text-sm font-medium">Basket</div>
          <div className="mt-2 text-xs opacity-80">
            Ident: {basketIdent ?? "—"}
          </div>

          <div className="mt-3 flex flex-col gap-2">
            <button
              className="rounded-lg border px-3 py-2 text-sm hover:bg-black/5 disabled:opacity-60"
              disabled={!!busy}
              onClick={ensureBasket}
            >
              {busy === "basket" ? "Creating…" : basketIdent ? "Basket Ready" : "Create Basket"}
            </button>

            <button
              className="rounded-lg bg-black px-3 py-2 text-sm text-white disabled:opacity-60"
              disabled={!!busy}
              onClick={startAuth}
            >
              {busy === "auth" ? "Redirecting…" : "Login (FiveM)"}
            </button>

            {checkoutUrl ? (
              <a className="rounded-lg bg-green-600 px-3 py-2 text-center text-sm text-white" href={checkoutUrl}>
                Checkout
              </a>
            ) : (
              <div className="text-xs opacity-70">
                Checkout link appears after basket is valid and has items (and may require login).
              </div>
            )}
          </div>
        </div>
      </aside>

      <section className="rounded-xl border p-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-semibold">{activeCategory?.name ?? "Packages"}</h2>
          {error ? <div className="text-sm text-red-600">{error}</div> : null}
        </div>

        {loading ? (
          <div className="mt-4 text-sm opacity-60">Loading packages…</div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(activeCategory?.packages ?? []).map((p) => (
              <div key={p.id} className="rounded-xl border p-4">
                <div className="text-sm font-semibold">{p.name}</div>
                {p.description ? (
                  <div className="mt-1 text-xs opacity-80 line-clamp-3">{p.description}</div>
                ) : null}

                <div className="mt-3 text-sm">
                  {priceText(p.total_price ?? p.price)}
                </div>

                <button
                  className="mt-3 w-full rounded-lg bg-black px-3 py-2 text-sm text-white disabled:opacity-60"
                  disabled={!!busy}
                  onClick={() => addToBasket(p)}
                >
                  {busy === `add:${p.id}` ? "Adding…" : "Add to basket"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
