"use client";

import { useEffect, useMemo, useState } from "react";

type Money = { formatted?: string; value?: number; currency?: string };

type Package = {
  id?: number | string;
  package_id?: number | string;
  name?: string;
  description?: string;
  image?: string;

  // Tebex can return these in multiple shapes
  price?: Money | string;
  total_price?: Money | string;
  base_price?: Money | string;

  // sometimes nested
  pricing?: {
    price?: Money | string;
    total_price?: Money | string;
    base_price?: Money | string;
  };

  package?: {
    id?: number | string;
    package_id?: number | string;
    name?: string;
    price?: Money | string;
    total_price?: Money | string;
    base_price?: Money | string;
  };
};

type Category = {
  id?: number | string;
  category_id?: number | string;
  name?: string;
  packages?: Package[];
};

type BasketLine = {
  id?: number;
  name?: string;
  quantity?: number;
  price?: Money | string;
  total_price?: Money | string;
  package?: { name?: string };
};

type Identity = { label: string };

const LS_KEY = "tebex_basket_ident";
const LS_IDENTITY_KEY = "tebex_identity_label";

function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in (payload as any)) {
    return (payload as any).data as T;
  }
  return payload as T;
}

function priceText(p?: Money | string | null) {
  if (!p) return "";
  if (typeof p === "string") return p;

  if (p.formatted) return p.formatted;

  if (typeof p.value === "number") {
    // Tebex usually uses minor units (pennies)
    return `£${(p.value / 100).toFixed(2)}`;
  }

  return "";
}

function getPackagePrice(p: any): Money | string | null {
  return (
    p?.total_price ??
    p?.price ??
    p?.base_price ??
    p?.pricing?.total_price ??
    p?.pricing?.price ??
    p?.pricing?.base_price ??
    p?.package?.total_price ??
    p?.package?.price ??
    p?.package?.base_price ??
    // formatted string fallbacks (in case Money object wasn't returned)
    p?.price?.formatted ??
    p?.total_price?.formatted ??
    p?.base_price?.formatted ??
    null
  );
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

function basketTotalText(basket: any): string | null {
  const t =
    basket?.data?.total_price?.formatted ??
    basket?.data?.total?.formatted ??
    basket?.data?.price?.formatted ??
    basket?.total_price?.formatted ??
    basket?.total?.formatted ??
    basket?.price?.formatted;

  return typeof t === "string" && t.trim() ? t : null;
}

// strict: numeric id only (prevents /undefined)
function packageIdStr(p: Package): string | null {
  const raw = p.id ?? p.package_id ?? p.package?.id ?? p.package?.package_id;
  if (raw === undefined || raw === null) return null;

  const s = String(raw).trim();
  if (!s || s === "undefined" || s === "null") return null;

  const n = Number(s);
  if (!Number.isFinite(n) || n <= 0) return null;

  return String(Math.trunc(n));
}

function extractIdentity(basket: any): Identity | null {
  const b = basket?.data ?? basket;

  const candidates = [
    b?.player?.username,
    b?.player?.name,
    b?.customer?.username,
    b?.customer?.name,
    b?.username,
    b?.email,
  ];

  const label = candidates.find((v: unknown) => typeof v === "string" && v.trim().length > 0) as
    | string
    | undefined;

  return label ? { label } : null;
}

export default function StoreClient() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const [basketIdent, setBasketIdent] = useState<string | null>(null);
  const [basket, setBasket] = useState<any>(null);

  const [identityLabel, setIdentityLabel] = useState<string | null>(null);

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
          const firstId = cats[0]?.id ?? cats[0]?.category_id ?? null;
          setActiveCategoryId(firstId != null ? String(firstId) : null);
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

  // Restore basket ident + identity from localStorage
  useEffect(() => {
    const ident = localStorage.getItem(LS_KEY);
    if (ident) setBasketIdent(ident);

    const savedLabel = localStorage.getItem(LS_IDENTITY_KEY);
    if (savedLabel) setIdentityLabel(savedLabel);
  }, []);

  async function refreshBasket(ident: string) {
    const res = await fetch(`/api/basket/${encodeURIComponent(ident)}`, { cache: "no-store" });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(`Failed to load basket (${res.status}) ${t}`);
    }
    const json = await res.json();

    setBasket(json);

    const identInfo = extractIdentity(json);
    if (identInfo) {
      setIdentityLabel(identInfo.label);
      localStorage.setItem(LS_IDENTITY_KEY, identInfo.label);
    } else {
      setIdentityLabel(null);
      localStorage.removeItem(LS_IDENTITY_KEY);
    }

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
        if (!cancelled) {
          setBasket(json);

          const identInfo = extractIdentity(json);
          if (identInfo) {
            setIdentityLabel(identInfo.label);
            localStorage.setItem(LS_IDENTITY_KEY, identInfo.label);
          } else {
            setIdentityLabel(null);
            localStorage.removeItem(LS_IDENTITY_KEY);
          }
        }
      } catch {
        localStorage.removeItem(LS_KEY);
        localStorage.removeItem(LS_IDENTITY_KEY);
        if (!cancelled) {
          setBasketIdent(null);
          setBasket(null);
          setIdentityLabel(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [basketIdent]);

  const activeCategory = useMemo(() => {
    if (!activeCategoryId) return categories[0] ?? null;
    return (
      categories.find((c) => String(c.id ?? c.category_id ?? "") === activeCategoryId) ??
      categories[0] ??
      null
    );
  }, [categories, activeCategoryId]);

  const checkoutUrl =
    basket?.data?.links?.checkout ??
    basket?.links?.checkout ??
    basket?.data?.checkout_url ??
    basket?.checkout_url ??
    null;

  const isAuthenticated = Boolean(identityLabel);

  async function ensureBasket() {
    if (basketIdent) return basketIdent;

    setBusy("basket");
    setError(null);

    try {
      const res = await fetch("/api/basket", { method: "POST" });
      const json = await res.json().catch(() => null);

      if (!res.ok) throw new Error(json?.error ?? `Failed to create basket (${res.status})`);

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
      if (!res.ok) throw new Error(json?.error ?? `Auth request failed (${res.status})`);

      const authUrl = extractFirstUrlDeep(json);
      if (!authUrl) throw new Error("Auth URL not found in response");

      window.location.href = authUrl;
    } finally {
      setBusy(null);
    }
  }

  async function addToBasket(pkg: Package) {
    const ident = await ensureBasket();
    const pid = packageIdStr(pkg);

    if (!pid) {
      setError("Missing package id (expected numeric id from Tebex).");
      return;
    }

    setBusy(`add:${pid}`);
    setError(null);

    try {
      if (!isAuthenticated) throw new Error("Please login (FiveM) first, then add items to basket.");

      const res = await fetch(`/api/basket/${encodeURIComponent(ident)}/packages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: Number(pid), quantity: 1 }),
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

  function logout() {
    localStorage.removeItem(LS_KEY);
    localStorage.removeItem(LS_IDENTITY_KEY);
    setBasketIdent(null);
    setBasket(null);
    setIdentityLabel(null);
    setError(null);
  }

  const basketLines = getBasketLines(basket);
  const basketTotal = basketTotalText(basket);

  return (
    <div className="grid gap-6 md:grid-cols-[260px_1fr]">
      <aside className="rounded-xl border p-4">
        <div className="text-sm font-medium">Categories</div>

        {loading ? (
          <div className="mt-3 text-sm opacity-60">Loading…</div>
        ) : (
          <div className="mt-3 space-y-1">
            {categories.map((c, idx) => {
              const cid = String(c.id ?? c.category_id ?? idx);
              return (
                <button
                  key={cid}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                    cid === activeCategoryId ? "bg-black text-white" : "hover:bg-black/5"
                  }`}
                  onClick={() => setActiveCategoryId(cid)}
                >
                  {c.name ?? "Category"}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-6 border-t pt-4">
          <div className="text-sm font-medium">Basket</div>

          {basketTotal ? (
            <div className="mt-2 text-sm font-semibold">Total: {basketTotal}</div>
          ) : (
            <div className="mt-2 text-xs opacity-70"></div>
          )}

          {identityLabel ? (
            <div className="mt-2 text-xs opacity-80 break-words">Logged in as: {identityLabel}</div>
          ) : (
            <div className="mt-2 text-xs opacity-70">Not logged in</div>
          )}

          <div className="mt-3 flex flex-col gap-2">

            <button
              className="rounded-lg bg-black px-3 py-2 text-sm text-white disabled:opacity-60"
              disabled={!!busy}
              onClick={startAuth}
            >
              {busy === "auth"
                ? "Redirecting…"
                : identityLabel
                  ? `Logged in as ${identityLabel}`
                  : "Login (FiveM)"}
            </button>

            {identityLabel ? (
              <button
                className="rounded-lg border px-3 py-2 text-sm hover:bg-black/5 disabled:opacity-60"
                disabled={!!busy}
                onClick={logout}
              >
                Log out
              </button>
            ) : null}

            {checkoutUrl ? (
              <a className="rounded-lg bg-green-600 px-3 py-2 text-center text-sm text-white" href={checkoutUrl}>
                Checkout
              </a>
            ) : (
              <div className="text-xs opacity-70">Checkout appears after items are added.</div>
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
            {(activeCategory?.packages ?? []).map((p, idx) => {
              const pid = packageIdStr(p);
              const disabledAdd = !!busy || !isAuthenticated || !pid;

              const price = priceText(getPackagePrice(p));

              return (
                <div key={pid ?? `${p.name ?? "pkg"}-${idx}`} className="rounded-xl border p-4">
                  {pid ? (
                    <a href={`/store/package/${pid}`} className="hover:underline">
                      <div className="text-sm font-semibold">{p.name ?? p.package?.name ?? "Package"}</div>
                    </a>
                  ) : (
                    <div className="text-sm font-semibold">{p.name ?? p.package?.name ?? "Package"}</div>
                  )}

                  {p.description ? (
                    <div className="mt-1 text-xs opacity-80 line-clamp-3">
                      {String(p.description).replace(/<[^>]*>/g, "")}
                    </div>
                  ) : null}

                  <div className="mt-3 text-sm">
                    {price ? price : <span className="opacity-70">Price unavailable</span>}
                  </div>

                  <div className="mt-3 flex gap-2">
                    {pid ? (
                      <a
                        className="flex-1 rounded-lg border px-3 py-2 text-center text-sm hover:bg-black/5"
                        href={`/store/package/${pid}`}
                      >
                        View
                      </a>
                    ) : (
                      <button className="flex-1 rounded-lg border px-3 py-2 text-sm opacity-60" disabled>
                        View
                      </button>
                    )}

                    <button
                      className="flex-1 rounded-lg bg-black px-3 py-2 text-sm text-white disabled:opacity-60"
                      disabled={disabledAdd}
                      onClick={() => addToBasket(p)}
                      title={!pid ? "Missing package id" : !isAuthenticated ? "Login (FiveM) first" : undefined}
                    >
                      {busy === `add:${pid}` ? "Adding…" : "Add"}
                    </button>
                  </div>

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
