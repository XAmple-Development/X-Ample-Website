"use client";

import { useEffect, useMemo, useState } from "react";

type Money = { formatted?: string; value?: number; currency?: string };
type Package = {
  id: number;
  name: string;
  description?: string;
  image?: string;
  price?: Money;
  total_price?: Money;
};
type Category = { id: number; name: string; packages?: Package[] };

type BasketLine = {
  id?: number; // basket line id (common)
  name?: string;
  quantity?: number;
  price?: Money;
  total_price?: Money;
  package?: { name?: string };
};

const LS_KEY = "tebex_basket_ident";

function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in (payload as any)) {
    return (payload as any).data as T;
  }
  return payload as T;
}

function priceText(p?: Money) {
  if (!p) return "";
  if (p.formatted) return p.formatted;
  if (typeof p.value === "number") return `£${(p.value / 100).toFixed(2)}`;
  return "";
}

function extractFirstUrlDeep(payload: unknown): string | null {
  const seen = new Set<unknown>();

  const walk = (v: unknown): string | null => {
    if (!v || typeof v !== "object") return null;
    if (seen.has(v)) return null;
    seen.add(v);

    const anyObj = v as Record<string, unknown>;
    const direct = anyObj.url;
    if (typeof direct === "string" && /^https?:\/\//i.test(direct)) return direct;

    const candidates = [
      anyObj.authUrl,
      anyObj.authenticationUrl,
      anyObj.redirect,
      anyObj.redirect_url,
      anyObj.checkout,
    ];
    for (const c of candidates) {
      if (typeof c === "string" && /^https?:\/\//i.test(c)) return c;
    }

    for (const key of Object.keys(anyObj)) {
      const found = walk(anyObj[key]);
      if (found) return found;
    }
    return null;
  };

  return walk(payload);
}

function getBasketLines(basket: any): BasketLine[] {
  return basket?.data?.packages ?? basket?.data?.basket?.packages ?? basket?.packages ?? [];
}

function getLineId(line: BasketLine): number | null {
  const id = Number(line.id);
  if (Number.isFinite(id) && id > 0) return id;

  const alt = Number((line as any).basket_package_id ?? (line as any).basketPackageId);
  return Number.isFinite(alt) && alt > 0 ? alt : null;
}

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
        setError(null);
        setLoading(true);

        const res = await fetch("/api/store/categories?includePackages=1", { cache: "no-store" });
        if (!res.ok) {
          const t = await res.text().catch(() => "");
          throw new Error(`Failed to load categories (${res.status}) ${t}`);
        }

        const json = await res.json();
        const cats = (unwrapData<Category[]>(json) ?? []).filter(Boolean);

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

  async function refreshBasket(ident: string) {
    const res = await fetch(`/api/basket/${encodeURIComponent(ident)}`, { cache: "no-store" });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(`Failed to load basket (${res.status}) ${t}`);
    }
    const json = await res.json();
    setBasket(json);
    return json;
  }

  // Fetch basket when we have ident
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!basketIdent) return;
      try {
        const res = await fetch(`/api/basket/${encodeURIComponent(basketIdent)}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Basket not found");
        const json = await res.json();
        if (!cancelled) setBasket(json);
      } catch {
        localStorage.removeItem(LS_KEY);
        if (!cancelled) {
          setBasketIdent(null);
          setBasket(null);
        }
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

  const checkoutUrl =
    basket?.data?.links?.checkout ??
    basket?.links?.checkout ??
    basket?.data?.checkout_url ??
    basket?.checkout_url ??
    null;

  const isAuthenticated =
    Boolean(basket?.data?.player) ||
    Boolean(basket?.data?.customer) ||
    Boolean(basket?.data?.username) ||
    Boolean(basket?.data?.email);

  async function ensureBasket() {
    if (basketIdent) return basketIdent;

    setBusy("basket");
    setError(null);

    try {
      const res = await fetch("/api/basket", { method: "POST" });
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(json?.error ?? `Failed to create basket (${res.status})`);
      }

      const ident: unknown =
        json?.data?.ident ??
        json?.data?.basket?.ident ??
        json?.ident ??
        json?.basket?.ident;

      if (!ident || typeof ident !== "string") throw new Error("Basket created but ident was missing");

      localStorage.setItem(LS_KEY, ident);
      setBasketIdent(ident);

      await refreshBasket(ident);
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
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(json?.error ?? `Auth request failed (${res.status})`);
      }

      const authUrl = extractFirstUrlDeep(json);
      if (!authUrl) {
        console.log("AUTH RESPONSE (no url found)", json);
        throw new Error("Auth URL not found in response (see console)");
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
      if (!isAuthenticated) {
        throw new Error("Please login (FiveM) first, then add items to basket.");
      }

      const res = await fetch(`/api/basket/${encodeURIComponent(ident)}/packages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkg.id, quantity: 1 }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? `Failed to add package (${res.status})`);

      await refreshBasket(ident);
    } finally {
      setBusy(null);
    }
  }

  async function removeFromBasket(basketPackageId: number) {
    if (!basketIdent) return;

    setBusy(`remove:${basketPackageId}`);
    setError(null);

    try {
      const res = await fetch(`/api/basket/${encodeURIComponent(basketIdent)}/packages/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ basketPackageId }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? `Failed to remove (${res.status})`);

      await refreshBasket(basketIdent);
    } finally {
      setBusy(null);
    }
  }

  const basketLines = getBasketLines(basket);

  return (
    <div className="grid gap-6 md:grid-cols-[260px_1fr]">
      <aside className="rounded-xl border p-4">
        <div className="text-sm font-medium">Categories</div>

        {loading ? (
          <div className="mt-3 text-sm opacity-60">Loading…</div>
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
          <div className="mt-2 text-xs opacity-80 break-all">Ident: {basketIdent ?? "—"}</div>

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
              {busy === "auth" ? "Redirecting…" : isAuthenticated ? "Logged in (FiveM)" : "Login (FiveM)"}
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

            <div className="mt-3 border-t pt-3">
              <div className="text-sm font-medium">Items</div>

              {basketIdent ? (
                <div className="mt-2 space-y-2">
                  {basketLines.length ? (
                    basketLines.map((line, idx) => {
                      const lineId = getLineId(line);
                      const name = line.name ?? line.package?.name ?? `Item ${idx + 1}`;
                      const qty = line.quantity ?? 1;

                      return (
                        <div
                          key={`${name}-${idx}`}
                          className="flex items-center justify-between gap-2 rounded-lg border p-2"
                        >
                          <div className="min-w-0">
                            <div className="truncate text-xs font-medium">{name}</div>
                            <div className="text-[11px] opacity-70">Qty: {qty}</div>
                          </div>

                          <button
                            className="rounded-lg border px-2 py-1 text-xs hover:bg-black/5 disabled:opacity-60"
                            disabled={!lineId || !!busy}
                            onClick={() => lineId && removeFromBasket(lineId)}
                            title={!lineId ? "Missing basket item id" : undefined}
                          >
                            {busy === `remove:${lineId}` ? "Removing…" : "Remove"}
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-xs opacity-70">No items yet.</div>
                  )}
                </div>
              ) : (
                <div className="mt-2 text-xs opacity-70">Create a basket to see items.</div>
              )}
            </div>

            {error ? <div className="text-xs text-red-600">{error}</div> : null}
          </div>
        </div>
      </aside>

      <section className="rounded-xl border p-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-semibold">{activeCategory?.name ?? "Packages"}</h2>
        </div>

        {loading ? (
          <div className="mt-4 text-sm opacity-60">Loading packages…</div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(activeCategory?.packages ?? []).map((p) => {
              const disabled = !!busy || !isAuthenticated;

              return (
                <div key={p.id} className="rounded-xl border p-4">
                  <div className="text-sm font-semibold">{p.name}</div>

                  {p.description ? (
                    <div className="mt-1 text-xs opacity-80 line-clamp-3">
                      {p.description.replace(/<[^>]*>/g, "")}
                    </div>
                  ) : null}

                  <div className="mt-3 text-sm">{priceText(p.total_price ?? p.price)}</div>

                  <button
                    className="mt-3 w-full rounded-lg bg-black px-3 py-2 text-sm text-white disabled:opacity-60"
                    disabled={disabled}
                    onClick={() => addToBasket(p)}
                    title={!isAuthenticated ? "Login (FiveM) first" : undefined}
                  >
                    {busy === `add:${p.id}` ? "Adding…" : "Add to basket"}
                  </button>

                  {!isAuthenticated ? (
                    <div className="mt-2 text-xs opacity-70">Login (FiveM) to add items.</div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
