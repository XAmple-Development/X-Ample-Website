// tebex-products.js (Netlify Function)
// Lists products (packages) from Tebex Headless API.

const DEFAULT_HEADLESS_BASE = "https://headless.tebex.io/api";

const json = (statusCode, body, extraHeaders = {}) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    ...extraHeaders,
  },
  body: JSON.stringify(body),
});

const getAuthHeader = () => {
  const projectId = process.env.TEBEX_PROJECT_ID;
  const privateKey = process.env.TEBEX_PRIVATE_KEY;
  if (!projectId || !privateKey) return null;
  const token = Buffer.from(`${projectId}:${privateKey}`).toString("base64");
  return `Basic ${token}`;
};

const normalizePrice = (value) => {
  if (value == null) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const mapProduct = (item, fallbackCurrency) => {
  // Works with several Tebex payload shapes.
  const price =
    normalizePrice(item?.sale?.discounted_price) ||
    normalizePrice(item?.sale?.price) ||
    normalizePrice(item?.base_price ?? item?.price?.amount ?? item?.price);

  const image = item?.image?.src ?? item?.image_url ?? item?.image ?? null;

  return {
    id: item?.id ?? item?.package_id ?? item?.identifier ?? item?.listing_id,
    name: item?.name ?? item?.package_name ?? "Untitled product",
    description: item?.description ?? item?.short_description ?? "",
    image,
    category: item?.category?.name ?? item?.category ?? item?.category_id ?? "General",
    price,
    salePrice:
      item?.sale?.discounted_price != null || item?.sale?.price != null
        ? normalizePrice(item?.sale?.discounted_price ?? item?.sale?.price)
        : null,
    currency:
      item?.currency?.iso_4217 ??
      item?.currency ??
      fallbackCurrency ??
      item?.price?.currency ??
      "USD",
    recurring:
      item?.expiry_length && item?.expiry_period
        ? `${item.expiry_length} ${item.expiry_period}`
        : null,
  };
};

exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "GET") {
    return json(405, { error: "Method not allowed" }, { Allow: "GET, OPTIONS" });
  }

  const accountToken = process.env.TEBEX_ACCOUNT_TOKEN; // vg3c-...
  const authHeader = getAuthHeader();
  const headlessBase = (process.env.TEBEX_HEADLESS_BASE || DEFAULT_HEADLESS_BASE).replace(/\/$/, "");

  if (!accountToken) return json(500, { error: "Missing TEBEX_ACCOUNT_TOKEN" });
  if (!authHeader) return json(500, { error: "Missing TEBEX_PROJECT_ID or TEBEX_PRIVATE_KEY" });

  try {
    // Headless "packages list"
    const response = await fetch(`${headlessBase}/accounts/${accountToken}/packages`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      return json(response.status, {
        error: "Failed to fetch products from Tebex",
        details: await response.text(),
      });
    }

    const payload = await response.json();

    const raw = payload?.data ?? payload?.packages ?? payload ?? [];
    const fallbackCurrency =
      payload?.currency?.iso_4217 ??
      payload?.currency ??
      payload?.price?.currency ??
      "USD";

    const products = (Array.isArray(raw) ? raw : [])
      .map((pkg) => mapProduct(pkg, fallbackCurrency))
      .filter((item) => item.id != null);

    return json(
      200,
      { products },
      {
        // keep it snappy but not hammering Tebex
        "Cache-Control": "public, max-age=300",
      }
    );
  } catch (error) {
    console.error("Tebex product fetch failed", error);
    return json(500, { error: "Unexpected error fetching Tebex products" });
  }
};
