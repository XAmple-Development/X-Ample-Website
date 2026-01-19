"use client";

type CreateBasketResponse = { data?: { ident?: string } };

const STORAGE_KEY = "xa_basket_ident";

export class BasketRequestError extends Error {
  ident?: string;
  status?: number;

  constructor(
    message: string,
    opts: { ident?: string; status?: number } = {},
  ) {
    super(message);
    this.name = "BasketRequestError";
    this.ident = opts.ident;
    this.status = opts.status;
  }
}

export function getStoredBasketIdent(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v && v.length > 0 ? v : null;
  } catch {
    return null;
  }
}

export function setStoredBasketIdent(ident: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, ident);
  } catch {
    // ignore storage failures
  }
}

export async function ensureBasketIdent(): Promise<string> {
  const existing = getStoredBasketIdent();
  if (existing) return existing;

  const res = await fetch("/api/basket/create", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({}),
  });
  const json = (await res.json().catch(() => null)) as
    | (CreateBasketResponse & { error?: string; message?: string })
    | null;
  if (!res.ok) {
    throw new BasketRequestError(
      (json && (json.error || json.message)) || `Request failed (${res.status})`,
      { status: res.status },
    );
  }

  const ident = json?.data?.ident;
  if (typeof ident !== "string" || ident.length === 0) {
    throw new BasketRequestError(
      "Basket created but ident was missing in the response.",
      { status: res.status },
    );
  }

  setStoredBasketIdent(ident);
  return ident;
}

export async function addPackageToBasket(args: {
  ident?: string;
  packageId: string;
  quantity?: number;
}) {
  const ident = args.ident ?? (await ensureBasketIdent());
  const res = await fetch(`/api/basket/${encodeURIComponent(ident)}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      package_id: args.packageId,
      quantity: typeof args.quantity === "number" ? args.quantity : 1,
    }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new BasketRequestError(
      (json && (json.error || json.message)) || `Request failed (${res.status})`,
      { ident, status: res.status },
    );
  }
  return { ident, json };
}

type TebexAuthLink = { name?: string; url?: string };
type TebexAuthLinksResponse = { data?: TebexAuthLink[] };

export async function getBasketAuthLinks(args: {
  ident?: string;
  returnUrl?: string;
}): Promise<TebexAuthLink[]> {
  const ident = args.ident ?? (await ensureBasketIdent());
  const returnUrl =
    args.returnUrl ??
    (typeof window !== "undefined" ? window.location.href : undefined) ??
    "/store/cart";

  const res = await fetch(
    `/api/basket/${encodeURIComponent(ident)}/auth?returnUrl=${encodeURIComponent(
      returnUrl,
    )}`,
    { method: "GET", headers: { Accept: "application/json" } },
  );

  const json = (await res.json().catch(() => null)) as
    | (TebexAuthLinksResponse & { error?: string; message?: string })
    | null;

  if (!res.ok) {
    throw new BasketRequestError(
      (json && (json.error || json.message)) || `Request failed (${res.status})`,
      { ident, status: res.status },
    );
  }

  const links = json?.data;
  if (!Array.isArray(links)) {
    throw new BasketRequestError(
      "Basket auth links missing from response.",
      { ident, status: res.status },
    );
  }

  return links;
}

export async function redirectToBasketAuth(args: {
  ident?: string;
  returnUrl?: string;
  providerName?: string;
}) {
  const providerName = (args.providerName ?? "FiveM").trim().toLowerCase();
  const links = await getBasketAuthLinks(args);
  const selected =
    links.find(
      (l) =>
        typeof l.name === "string" &&
        l.name.trim().toLowerCase() === providerName &&
        typeof l.url === "string" &&
        l.url.length > 0,
    ) ??
    links.find((l) => typeof l.url === "string" && l.url.length > 0) ??
    null;

  const authUrl = selected?.url;
  if (!authUrl) {
    throw new BasketRequestError("No auth URL returned by Tebex.", {
      ident: args.ident,
    });
  }

  if (typeof window !== "undefined") window.location.href = authUrl;
}

