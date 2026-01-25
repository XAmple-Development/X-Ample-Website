import PackageClient from "./package-client";
import { tebexAccountToken, tebexFetch } from "@/lib/tebex";

export default function PackagePage({ params }: { params: { id: string } }) {
  const pid = String(params.id || "").trim();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <PackageJsonLd id={pid} />
      <PackageClient id={params.id} />
    </main>
  );
}

async function PackageJsonLd({ id }: { id: string }) {
  if (!id) return null;

  try {
    const token = tebexAccountToken();
    const raw = await tebexFetch<any>(
      `/accounts/${encodeURIComponent(token)}/packages/${encodeURIComponent(id)}`,
      { method: "GET" },
    );
    const p = raw?.data ?? raw;

    const name = typeof p?.name === "string" ? p.name : `Package ${id}`;
    const description =
      typeof p?.description === "string" ? String(p.description).replace(/<[^>]*>/g, "") : undefined;

    const money = p?.total_price ?? p?.price ?? p?.base_price ?? null;
    const currency =
      typeof money?.currency === "string" && money.currency.trim() ? money.currency.trim().toUpperCase() : "USD";
    const value = typeof money?.value === "number" && Number.isFinite(money.value) ? money.value / 100 : null;

    const base = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://x-ampledevelopment.co.uk").replace(
      /\/+$/,
      "",
    );
    const url = `${base}/store/package/${encodeURIComponent(id)}`;

    const jsonLd: any = {
      "@context": "https://schema.org",
      "@type": "Product",
      name,
      url,
      brand: { "@type": "Brand", name: "X-Ample Development" },
    };
    if (description) jsonLd.description = description;
    if (typeof p?.image === "string" && p.image.trim()) jsonLd.image = p.image.trim();

    if (value != null) {
      jsonLd.offers = {
        "@type": "Offer",
        priceCurrency: currency,
        price: String(value),
        availability: "https://schema.org/InStock",
        url,
      };
    }

    return (
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    );
  } catch {
    return null;
  }
}
