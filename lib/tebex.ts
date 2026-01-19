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

export function getBasicAuthHeader() {
  const user = getEnv("TEBEX_PUBLIC_TOKEN");
  const pass = getEnv("TEBEX_PRIVATE_KEY");
  if (!user || !pass) return null;
  const raw = `${user}:${pass}`;
  // Support both Node.js (Buffer) and Edge runtimes (btoa).
  const encoded =
    typeof globalThis.btoa === "function"
      ? globalThis.btoa(raw)
      : Buffer.from(raw).toString("base64");
  return `Basic ${encoded}`;
}

export function getWebstoreToken() {
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

  // Use text() first, then JSON.parse — avoids runtime-specific `res.json()` issues.
  const text = await res.text().catch(() => "");
  const contentType = res.headers.get("content-type") ?? "";
  const looksJson =
    contentType.includes("application/json") ||
    text.trim().startsWith("{") ||
    text.trim().startsWith("[");
  const body: unknown = looksJson ? safeJsonParse(text) : text;

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
 * Tebex request helper for endpoints that return very large bodies.
 *
 * For many basket mutation endpoints, Tebex returns a full basket payload that
 * can include long HTML descriptions/media, which can crash serverless/edge
 * environments when buffering/parsing the response.
 *
 * This helper only reads/parses the body on error.
 */
async function tebexRequestNoBody(url: string, init: TebexFetchInit = {}) {
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

  if (res.ok) {
    // Important: abort/cancel body consumption. Some runtimes will continue to
    // download large responses unless explicitly canceled, which can lead to
    // serverless crashes/timeouts.
    try {
      res.body?.cancel?.();
    } catch {
      // ignore
    }
    return;
  }

  // On error, read only a small snippet (avoid buffering huge bodies).
  const snippet = await readBodySnippet(res, 8_192);
  try {
    res.body?.cancel?.();
  } catch {
    // ignore
  }

  const contentType = res.headers.get("content-type") ?? "";
  const looksJson =
    contentType.includes("application/json") ||
    snippet.trim().startsWith("{") ||
    snippet.trim().startsWith("[");
  const body: unknown = looksJson ? safeJsonParse(snippet) : snippet;

  const msg =
    typeof body === "string"
      ? body
      : body && typeof body === "object"
        ? JSON.stringify(body)
        : "Unknown error";
  throw new Error(`Tebex error ${res.status}: ${msg}`);
}

async function readBodySnippet(res: Response, maxChars: number): Promise<string> {
  // Prefer streaming read to avoid buffering. Works in Node (undici) and edge.
  const body = res.body;
  if (body && typeof (body as any).getReader === "function") {
    const reader = (body as any).getReader();
    const decoder = new TextDecoder();
    let out = "";
    try {
      while (out.length < maxChars) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) out += decoder.decode(value, { stream: true });
      }
      out += decoder.decode();
      return out.slice(0, maxChars);
    } catch {
      return out.slice(0, maxChars);
    } finally {
      try {
        reader.releaseLock?.();
      } catch {
        // ignore
      }
    }
  }

  // Fallback: text() (may buffer, but should be rare).
  const text = await res.text().catch(() => "");
  return text.slice(0, maxChars);
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
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

/**
 * Basket-scoped request that does NOT read the body on success.
 * Use for basket mutations (add/remove/update qty) to avoid serverless crashes.
 */
export async function tebexBasketRequestNoBody(
  path: string,
  init: TebexFetchInit = {},
) {
  const url = `https://headless.tebex.io/api${
    path.startsWith("/") ? path : `/${path}`
  }`;
  return tebexRequestNoBody(url, init);
}

// Backwards-compatible name (account-scoped).
export const tebexFetch = tebexAccountFetch;

