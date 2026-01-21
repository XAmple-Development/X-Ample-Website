"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import sanitizeHtml from "sanitize-html";

type Money = { formatted?: string; value?: number; currency?: string };

type Basket = any;
type Identity = { label: string };

const LS_KEY = "tebex_basket_ident";
const LS_IDENTITY_KEY = "tebex_identity_label";

function pickIdFromPath(pathname: string | null): string | null {
  if (!pathname) return null;
  const parts = pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1] ?? "";
  const id = last.trim();
  if (!id || id === "undefined" || id === "null") return null;
  return id;
}

function priceText(p?: Money) {
  if (!p) return "";
  if (p.formatted) return p.formatted;
  if (typeof p.value === "number") {
    const currency =
      typeof p.currency === "string" && /^[A-Z]{3}$/i.test(p.currency.trim()) ? p.currency.trim().toUpperCase() : "USD";
    try {
      return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(p.value / 100);
    } catch {
      return `$${(p.value / 100).toFixed(2)}`;
    }
  }
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

function checkoutUrlFromBasket(basket: any): string | null {
  const u =
    basket?.data?.links?.checkout ??
    basket?.links?.checkout ??
    basket?.data?.checkout_url ??
    basket?.checkout_url ??
    null;
  return typeof u === "string" && u.trim() ? u : null;
}

function safeHtmlFromTebex(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "h1",
      "h2",
      "h3",
      "h4",
      "span",
      "br",
      "hr",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
    ]),
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      "*": ["class", "style"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
  });
}

export default function PackageClient({ id }: { id?: string }) {
  const pathname = usePathname();

  const effectiveId = useMemo(() => {
    const fromProp = (id ?? "").trim();
    if (fromProp && fromProp !== "undefined" && fromProp !== "null") return fromProp;
    return pickIdFromPath(pathname);
  }, [id, pathname]);

  const [pkg, setPkg] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [basketIdent, setBasketIdent] = useState<string | null>(null);
  const [basket, setBasket] = useState<Basket | null>(null);
  const [identityLabel, setIdentityLabel] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // ✅ Derive display values safely (even when pkg is null) BEFORE any returns
  const name = (pkg?.name ?? "Package") as string;
  const image = (pkg?.image ?? pkg?.image_url ?? null) as string | null;
  const total = (pkg?.total_price ?? pkg?.price) as Money | undefined;
  const description = (typeof pkg?.description === "string" ? pkg.description : "") as string;

  // ✅ Hook runs on every render (no conditional hook usage)
  const descriptionHtml = useMemo(() => {
    if (!description) return "";
    return safeHtmlFromTebex(description);
  }, [description]);

  // Restore basket ident + identity from localStorage first
  useEffect(() => {
    const ident = localStorage.getItem(LS_KEY);
    if (ident) setBasketIdent(ident);

    const savedLabel = localStorage.getItem(LS_IDENTITY_KEY);
    if (savedLabel) setIdentityLabel(savedLabel);
  }, []);

  async function refreshBasket(ident: string) {
    const res = await fetch(`/api/basket/${encodeURIComponent(ident)}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load basket (${res.status})`);
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

  async function ensureBasket(): Promise<string> {
    if (basketIdent) return basketIdent;

    const lsIdent = localStorage.getItem(LS_KEY);
    if (lsIdent) {
      setBasketIdent(lsIdent);
      return lsIdent;
    }

    setBusy("basket");
    setNotice(null);

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

        const identInfo = extractIdentity(json);
        if (identInfo) {
          setIdentityLabel(identInfo.label);
          localStorage.setItem(LS_IDENTITY_KEY, identInfo.label);
        } else {
          setIdentityLabel(null);
          localStorage.removeItem(LS_IDENTITY_KEY);
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

  const checkoutUrl = checkoutUrlFromBasket(basket);
  const isAuthenticated = Boolean(identityLabel);

  async function startAuth() {
    const ident = await ensureBasket();
    setBusy("auth");
    setNotice(null);

    try {
      const hardCanonical = "https://x-ampledevelopment.co.uk";
      const base =
        window.location.host.endsWith(".netlify.app")
          ? hardCanonical
          : process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const returnUrl = `${base.replace(/\/+$/, "")}/dashboard/auth?ident=${ident}&returnTo=${encodeURIComponent(
        `/store/package/${encodeURIComponent(effectiveId || "")}`,
      )}`;

      const res = await fetch(
        `/api/basket/auth?ident=${encodeURIComponent(ident)}&returnUrl=${encodeURIComponent(returnUrl)}`,
        { cache: "no-store" },
      );
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? `Auth request failed (${res.status})`);

      const authUrl = extractFirstUrlDeep(json);
      if (!authUrl) throw new Error("Auth URL not found in response");

      window.location.href = authUrl;
    } finally {
      setBusy(null);
    }
  }

  async function addThisToBasket() {
    if (!effectiveId) {
      setError("Missing package id in URL (check your /store links).");
      return;
    }

    const ident = await ensureBasket();
    setBusy("add");
    setError(null);
    setNotice(null);

    try {
      if (!isAuthenticated) throw new Error("Please login (FiveM) first, then add this package to basket.");

      // Analytics (optional): plausible custom event
      try {
        (window as any)?.plausible?.("Store Add To Basket", { props: { packageId: effectiveId } });
      } catch {
        // ignore
      }

      const res = await fetch(`/api/basket/${encodeURIComponent(ident)}/packages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: Number(effectiveId), quantity: 1 }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? `Failed to add package (${res.status})`);

      await refreshBasket(ident);
      setNotice("Added to basket.");
    } finally {
      setBusy(null);
    }
  }

  useEffect(() => {
    let cancelled = false;

    if (!effectiveId) {
      setError("Missing package id in URL (check your /store links).");
      setPkg(null);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/store/package/${encodeURIComponent(effectiveId)}`, {
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
  }, [effectiveId]);

  // Analytics (optional): package view event
  useEffect(() => {
    if (!effectiveId) return;
    try {
      (window as any)?.plausible?.("Store Package View", { props: { packageId: effectiveId } });
    } catch {
      // ignore
    }
  }, [effectiveId]);

  if (loading) return <div className="text-sm opacity-60">Loading…</div>;
  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (!pkg) return <div className="text-sm opacity-60">Not found.</div>;

  return (
    <div className="rounded-xl border p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <a className="opacity-70 hover:underline" href="/store">
          ← Back to store
        </a>
        {effectiveId ? (
          <a className="opacity-70 hover:underline" href={`/docs/package/${encodeURIComponent(effectiveId)}`}>
            View docs
          </a>
        ) : null}
      </div>

      <div className="mt-3 text-2xl font-semibold">{name}</div>

      {total ? <div className="mt-2 text-sm font-semibold">{priceText(total)}</div> : null}

      <div className="mt-4 rounded-xl border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm">
            {identityLabel ? (
              <span className="opacity-70">Signed in as </span>
            ) : (
              <span className="opacity-70">Sign in to purchase.</span>
            )}
            {identityLabel ? <span className="font-medium">{identityLabel}</span> : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {!isAuthenticated ? (
              <button
                type="button"
                className="rounded-lg bg-black px-3 py-2 text-sm text-white disabled:opacity-60"
                disabled={!!busy}
                onClick={startAuth}
              >
                {busy === "auth" ? "Opening…" : "Login (FiveM)"}
              </button>
            ) : (
              <button
                type="button"
                className="rounded-lg bg-black px-3 py-2 text-sm text-white disabled:opacity-60"
                disabled={!!busy}
                onClick={addThisToBasket}
              >
                {busy === "add" ? "Adding…" : "Add to basket"}
              </button>
            )}

            {checkoutUrl ? (
              <a
                className="rounded-lg border px-3 py-2 text-sm hover:bg-black/5"
                href={checkoutUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  try {
                    (window as any)?.plausible?.("Store Checkout Click", { props: { ident: basketIdent ?? "" } });
                  } catch {
                    // ignore
                  }
                }}
              >
                Checkout
              </a>
            ) : (
              <a className="rounded-lg border px-3 py-2 text-sm hover:bg-black/5" href="/store">
                View basket
              </a>
            )}
          </div>
        </div>

        {notice ? <div className="mt-3 text-xs text-foreground/70">{notice}</div> : null}
      </div>

      {image ? (
        <img src={image} alt={name} className="mt-4 w-full rounded-xl border object-cover" />
      ) : null}

      {descriptionHtml ? (
        <div
          className="prose prose-invert prose-sm mt-4 max-w-none"
          dangerouslySetInnerHTML={{ __html: descriptionHtml }}
        />
      ) : (
        <div className="mt-4 text-sm opacity-70">No description provided.</div>
      )}
    </div>
  );
}
