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

type TebexVariable = {
  id: number;
  name: string;
  description?: string;
  required?: boolean;
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

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

/**
 * Best-effort extraction of package variables from Tebex package detail payload.
 * Tebex response shapes vary; this covers the common ones.
 */
function extractVariables(pkgPayload: unknown): TebexVariable[] {
  const root = unwrapData<any>(pkgPayload);

  const candidates: unknown[] = [];

  if (isRecord(root)) {
    if (Array.isArray((root as any).variables)) candidates.push((root as any).variables);
    if (Array.isArray((root as any).package_variables)) candidates.push((root as any).package_variables);
    if (isRecord((root as any).package) && Array.isArray((root as any).package.variables)) {
      candidates.push((root as any).package.variables);
    }
  }

  for (const c of candidates) {
    if (!Array.isArray(c)) continue;

    const vars = c
      .map((x: any) => {
        const id = Number(x?.id ?? x?.variable_id);
        const name = String(x?.name ?? x?.label ?? x?.identifier ?? "");
        const description =
          typeof x?.description === "string"
            ? x.description
            : typeof x?.help === "string"
              ? x.help
              : undefined;

        const required =
          typeof x?.required === "boolean"
            ? x.required
            : typeof x?.is_required === "boolean"
              ? x.is_required
              : typeof x?.mandatory === "boolean"
                ? x.mandatory
                : undefined;

        if (!Number.isFinite(id) || id <= 0 || !name) return null;

        return { id, name, description, required };
      })
      .filter(Boolean) as TebexVariable[];

    if (vars.length) return vars;
  }

  return [];
}

export default function StoreClient() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

  const [basketIdent, setBasketIdent] = useState<string | null>(null);
  const [basket, setBasket] = useState<any>(null);

  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Variable prompt modal state
  const [varModalOpen, setVarModalOpen] = useState(false);
  const [varModalPkg, setVarModalPkg] = useState<Package | null>(null);
  const [varModalVars, setVarModalVars] = useState<TebexVariable[]>([]);
  const [varValues, setVarValues] = useState<Record<string, string>>({});

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

  async function fetchPackageVariables(packageId: number): Promise<TebexVariable[]> {
    const res = await fetch(`/api/store/package/${encodeURIComponent(String(packageId))}`, {
      cache: "no-store",
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(json?.error ?? `Failed to load package details (${res.status})`);
    }

    const vars = extractVariables(json);
    return vars;
  }

  function openVariableModal(pkg: Package, vars: TebexVariable[], message?: string) {
    setError(message ?? null);
    setVarModalPkg(pkg);
    setVarModalVars(vars);

    // reset values (or keep previous if you want)
    const initial: Record<string, string> = {};
    for (const v of vars) initial[String(v.id)] = "";
    setVarValues(initial);

    setVarModalOpen(true);
  }

  async function submitVariableModal() {
    if (!varModalPkg) return;

    const ident = await ensureBasket();

    // Validate required
    for (const v of varModalVars) {
      const val = (varValues[String(v.id)] ?? "").trim();
      if ((v.required ?? true) && !val) {
        setError(`Please fill: ${v.name}`);
        return;
      }
    }

    setBusy(`add:${varModalPkg.id}`);
    setError(null);

    try {
      const res = await fetch(`/api/basket/${encodeURIComponent(ident)}/packages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: varModalPkg.id,
          quantity: 1,
          variableValues: varValues,
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          json?.tebexBody?.detail ??
          json?.error ??
          `Failed to add package (${res.status})`;
        throw new Error(msg);
      }

      setVarModalOpen(false);
      setVarModalPkg(null);
      setVarModalVars([]);
      setVarValues({});

      await refreshBasket(ident);
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

      if (!res.ok) {
        // If Tebex is asking for variables, open modal
        const detail: string | undefined = json?.tebexBody?.detail;
        const isVariableError =
          res.status === 400 &&
          typeof detail === "string" &&
          /Please enter/i.test(detail) &&
          /Variable/i.test(detail);

        if (isVariableError) {
          const vars = await fetchPackageVariables(pkg.id);

          // If we couldn't parse variables, still show the Tebex message so you can adjust extraction.
          if (!vars.length) {
            console.log("PACKAGE DETAIL (no vars parsed)", { packageId: pkg.id, json });
            throw new Error(detail);
          }

          openVariableModal(pkg, vars, detail);
          return; // stop here; user will submit modal
        }

        const msg =
          json?.tebexBody?.detail ??
          json?.error ??
          `Failed to add package (${res.status})`;
        throw new Error(msg);
      }

      await refreshBasket(ident);
    } finally {
      setBusy(null);
    }
  }

  const disabledAddByAuth = !isAuthenticated;

  return (
    <div className="grid gap-6 md:grid-cols-[260px_1fr]">
      {/* Variable Modal */}
      {varModalOpen && varModalPkg ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
            <div className="text-lg font-semibold">Extra info required</div>
            <div className="mt-1 text-sm opacity-80">
              {varModalPkg.name} needs additional details before it can be added to your basket.
            </div>

            {error ? <div className="mt-3 text-sm text-red-600">{error}</div> : null}

            <div className="mt-4 space-y-3">
              {varModalVars.map((v) => {
                const key = String(v.id);
                return (
                  <label key={key} className="block">
                    <div className="text-sm font-medium">
                      {v.name} {(v.required ?? true) ? <span className="text-red-600">*</span> : null}
                    </div>
                    {v.description ? (
                      <div className="mt-1 text-xs opacity-70">{v.description}</div>
                    ) : null}
                    <input
                      className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"
                      value={varValues[key] ?? ""}
                      onChange={(e) =>
                        setVarValues((prev) => ({ ...prev, [key]: e.target.value }))
                      }
                      placeholder="Enter value…"
                    />
                  </label>
                );
              })}
            </div>

            <div className="mt-5 flex gap-2">
              <button
                className="flex-1 rounded-lg border px-3 py-2 text-sm hover:bg-black/5"
                disabled={!!busy}
                onClick={() => {
                  setVarModalOpen(false);
                  setVarModalPkg(null);
                  setVarModalVars([]);
                  setVarValues({});
                  setError(null);
                }}
              >
                Cancel
              </button>
              <button
                className="flex-1 rounded-lg bg-black px-3 py-2 text-sm text-white disabled:opacity-60"
                disabled={!!busy}
                onClick={submitVariableModal}
              >
                {busy?.startsWith("add:") ? "Adding…" : "Add to basket"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

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
              const disabled = !!busy || disabledAddByAuth;

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
