type TebexFetchInit = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

function getEnv(name: string): string | null {
  const v = process.env[name];
  return v && v.trim().length > 0 ? v : null;
}

export function hasTebexEnv() {
  return hasTebexAccountEnv();
}

export function hasTebexAuthEnv() {
  return !!getEnv("TEBEX_PUBLIC_TOKEN") && !!getEnv("TEBEX_PRIVATE_KEY");
}

export function hasTebexAccountEnv() {
  return !!getEnv("TEBEX_WEBSTORE_TOKEN") && hasTebexAuthEnv();
}

export function getSiteUrl() {
  return getEnv("SITE_URL") ?? "";
}

function getBasicAuthHeader() {
  const user = getEnv("TEBEX_PUBLIC_TOKEN");
  const pass = getEnv("TEBEX_PRIVATE_KEY");
  if (!user || !pass) return null;
  const encoded = Buffer.from(`${user}:${pass}`).toString("base64");
  return `Basic ${encoded}`;
}

function getWebstoreToken() {
  return getEnv("TEBEX_WEBSTORE_TOKEN");
}

async function tebexRequest<T>(url: string, init: TebexFetchInit = {}) {
  const auth = getBasicAuthHeader();
  if (!auth) {
    throw new Error("Missing env vars: TEBEX_PUBLIC_TOKEN / TEBEX_PRIVATE_KEY");
  }

  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await res.json().catch(() => null) : await res.text();

  if (!res.ok) {
    const msg =
      typeof body === "string"
        ? body
        : body && typeof body === "object"
          ? JSON.stringify(body)
          : "Unknown error";
    throw new Error(`Tebex error ${res.status}: ${msg}`);
  }

  return body as T;
}

/**
 * Tebex "account-scoped" endpoints.
 * Example: /categories, /packages/:id, /baskets (create), /accounts/{token}/baskets/:ident (get)
 */
export async function tebexAccountFetch<T>(
  path: string,
  init: TebexFetchInit = {},
): Promise<T> {
  const token = getWebstoreToken();
  if (!token) throw new Error("Missing env var: TEBEX_WEBSTORE_TOKEN");

  const url = `https://headless.tebex.io/api/accounts/${encodeURIComponent(
    token,
  )}${path.startsWith("/") ? path : `/${path}`}`;

  return tebexRequest<T>(url, init);
}

/**
 * Tebex "basket-scoped" endpoints.
 * Example: /baskets/{basketIdent}/packages (no accounts/{token} prefix)
 */
export async function tebexBasketFetch<T>(
  path: string,
  init: TebexFetchInit = {},
): Promise<T> {
  const url = `https://headless.tebex.io/api${
    path.startsWith("/") ? path : `/${path}`
  }`;
  return tebexRequest<T>(url, init);
}

// Backwards-compatible name (account-scoped).
export const tebexFetch = tebexAccountFetch;

