import { NextResponse } from "next/server";
import { tebexAccountToken, tebexFetch } from "@/lib/tebex";

export const runtime = "nodejs";

type TebexMoney = {
  formatted?: string;
  value?: number;
  currency?: string;
};

type TebexPackage = {
  id: number;
  name?: string;
  description?: string;
  image?: string;
  price?: TebexMoney;
  base_price?: TebexMoney;
  total_price?: TebexMoney;
};

type TebexCategory = {
  id: number;
  name?: string;
  packages?: Array<{
    id?: number;
    package_id?: number;
    name?: string;
    description?: string;
    image?: string;
    price?: TebexMoney;
    base_price?: TebexMoney;
    total_price?: TebexMoney;
  }>;
};

function asNumber(v: unknown): number | null {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Extract an array from Tebex responses, regardless of wrapping.
 * Supports:
 *  - { data: [...] }
 *  - { data: { categories: [...] } } / { data: { packages: [...] } }
 *  - { categories: [...] } / { packages: [...] }
 *  - plain [...]
 */
function extractArray<T>(payload: any, keys: string[]): T[] {
  const root = payload?.data ?? payload;

  if (Array.isArray(root)) return root as T[];

  if (root && typeof root === "object") {
    for (const k of keys) {
      const v = (root as any)[k];
      if (Array.isArray(v)) return v as T[];
    }
  }

  // one more level deep
  if (root && typeof root === "object") {
    for (const k of Object.keys(root)) {
      const inner = (root as any)[k];
      if (inner && typeof inner === "object") {
        for (const wanted of keys) {
          const v = (inner as any)[wanted];
          if (Array.isArray(v)) return v as T[];
        }
      }
    }
  }

  return [];
}

export async function GET(req: Request) {
  const url = new URL(req.url);

  const includePackages = url.searchParams.get("includePackages") ?? "1";
  const basketIdent = (url.searchParams.get("basketIdent") ?? "").trim();

  const token = tebexAccountToken();

  // 1) Categories (with packages)
  const categoriesRaw = await tebexFetch<any>(
    `/accounts/${encodeURIComponent(token)}/categories?includePackages=${encodeURIComponent(includePackages)}`,
    { method: "GET" },
  );

  if (includePackages !== "1") {
    return NextResponse.json(categoriesRaw);
  }

  const categories = extractArray<TebexCategory>(categoriesRaw, ["categories"]);

  // 2) Packages WITH basket context (gives correct pricing for that basket)
  // Docs: /accounts/{token}/packages?basketIdent={basketIdent} :contentReference[oaicite:1]{index=1}
  const packagesPath =
    basketIdent.length > 0
      ? `/accounts/${encodeURIComponent(token)}/packages?basketIdent=${encodeURIComponent(basketIdent)}`
      : `/accounts/${encodeURIComponent(token)}/packages`;

  const packagesRaw = await tebexFetch<any>(packagesPath, { method: "GET" });
  const packages = extractArray<TebexPackage>(packagesRaw, ["packages"]);

  const byId = new Map<number, TebexPackage>();
  for (const p of packages) {
    const id = asNumber(p?.id);
    if (id) byId.set(id, p);
  }

  // 3) Merge package price fields into category packages
  const mergedCategories = categories.map((cat) => {
    const pkgs = Array.isArray(cat.packages) ? cat.packages : [];
    const mergedPackages = pkgs.map((p) => {
      const pid = asNumber(p?.id ?? (p as any)?.package_id);
      const full = pid ? byId.get(pid) : undefined;

      return {
        ...p,
        id: pid ?? p?.id,
        name: p?.name ?? full?.name,
        description: p?.description ?? full?.description,
        image: p?.image ?? full?.image,
        price: p?.price ?? full?.price,
        base_price: p?.base_price ?? full?.base_price,
        total_price: p?.total_price ?? full?.total_price,
      };
    });

    return { ...cat, packages: mergedPackages };
  });

  // 4) Preserve Tebex wrapper shape if present
  if (categoriesRaw && typeof categoriesRaw === "object" && categoriesRaw !== null && "data" in categoriesRaw) {
    const data = (categoriesRaw as any).data;
    if (Array.isArray(data)) {
      return NextResponse.json({ ...(categoriesRaw as any), data: mergedCategories });
    }
    if (data && typeof data === "object") {
      const nextData = { ...(data as any) };
      nextData.categories = mergedCategories;
      return NextResponse.json({ ...(categoriesRaw as any), data: nextData });
    }
  }

  return NextResponse.json({ data: mergedCategories });
}
