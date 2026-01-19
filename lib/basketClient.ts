"use client";

type CreateBasketResponse = {
  ident?: string;
  data?: { ident?: string };
  basket?: { ident?: string };
  basketIdent?: string;
};

const STORAGE_KEY = "xa_basket_ident";

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
    throw new Error(
      (json && (json.error || json.message)) || `Request failed (${res.status})`,
    );
  }

  const ident =
    json?.ident ?? json?.data?.ident ?? json?.basket?.ident ?? json?.basketIdent;
  if (typeof ident !== "string" || ident.length === 0) {
    throw new Error("Basket created but ident was missing in the response.");
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
    throw new Error(
      (json && (json.error || json.message)) || `Request failed (${res.status})`,
    );
  }
  return { ident, json };
}

