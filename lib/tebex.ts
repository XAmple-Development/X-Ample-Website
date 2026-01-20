export type TebexMoney = {
    formatted?: string;
    value?: number;
    currency?: string;
  };
  
  export type TebexPackage = {
    id: number;
    name: string;
    description?: string;
    image?: string;
    price?: TebexMoney;
    base_price?: TebexMoney;
    total_price?: TebexMoney;
  };
  
  export type TebexCategory = {
    id: number;
    name: string;
    packages?: TebexPackage[];
  };
  
  function mustEnv(name: string) {
    const v = process.env[name];
    if (!v) throw new Error(`Missing env var: ${name}`);
    return v;
  }
  
  export function tebexAccountToken() {
    return mustEnv("TEBEX_WEBSTORE_TOKEN");
  }
  
  function authHeader() {
    const username = mustEnv("TEBEX_PUBLIC_TOKEN");
    const password = mustEnv("TEBEX_PRIVATE_KEY");
    const token = Buffer.from(`${username}:${password}`, "utf8").toString("base64");
    return `Basic ${token}`;
  }
  
  export async function tebexFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `https://headless.tebex.io/api${path}`;
    const res = await fetch(url, {
      ...init,
      headers: {
        Authorization: authHeader(),
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });
  
    const text = await res.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
  
    if (!res.ok) {
      const msg = typeof data === "object" && data ? JSON.stringify(data) : String(data);
      throw new Error(`Tebex ${res.status}: ${msg}`);
    }
  
    return data as T;
  }
  
  export function priceText(p?: TebexMoney) {
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
  
  export function siteUrl() {
    return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  }
  