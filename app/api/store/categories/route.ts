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

function unwrapData<T>(payload: any): T {
  return (payload?.data ?? payload) as T;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const includePackages = url.searchParams.get("includePackages") ?? "1";

  const token = tebexAccountToken();

  // 1) Categories (optionally with packages)
  const categoriesRaw = await tebexFetch<unknown>(
    `/accounts/${encodeURIComponent(token)}/categories?includePackages=${encodeURIComponent(includePackages)}`,
    { method: "GET" },
  );

  // If caller doesn't want packages, just return the raw payload
  if (includePackages !== "1") {
    return NextResponse.json(categoriesRaw);
  }

  const categories = unwrapData<TebexCategory[]>(categoriesRaw) ?? [];

  // 2) All packages (this endpoint is the one that reliably includes price fields)
  const packagesRaw = await tebexFetch<unknown>(
    `/accounts/${encodeURIComponent(token)}/packages`,
    { method: "GET" },
  );

  const packages = unwrapData<TebexPackage[]>(packagesRaw) ?? [];
  const byId = new Map<number, TebexPackage>();
  for (const p of packages) {
    const id = asNumber(p?.id);
    if (id) byId.set(id, p);
  }

  // 3) Merge prices into category packages
  const merged = categories.map((cat) => {
    const pkgs = Array.isArray(cat.packages) ? cat.packages : [];

    const mergedPackages = pkgs.map((p) => {
      const pid = asNumber(p?.id ?? (p as any)?.package_id);
      const full = pid ? byId.get(pid) : undefined;

      // Prefer existing fields, but fill missing price/base/total from full package record
      return {
        ...p,
        id: pid ?? p?.id,
        price: p?.price ?? full?.price,
        base_price: p?.base_price ?? full?.base_price,
        total_price: p?.total_price ?? full?.total_price,
        image: p?.image ?? full?.image,
        description: p?.description ?? full?.description,
        name: p?.name ?? full?.name,
      };
    });

    return {
      ...cat,
      packages: mergedPackages,
    };
  });

  // Preserve Tebex's usual { data: ... } wrapping style if present
  if (categoriesRaw && typeof categoriesRaw === "object" && "data" in (categoriesRaw as any)) {
    return NextResponse.json({ ...(categoriesRaw as any), data: merged });
  }

  return NextResponse.json(merged);
}
