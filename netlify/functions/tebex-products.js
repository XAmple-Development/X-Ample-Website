// Use Headless API so we can authenticate with the Private Key shown in the Tebex
// dashboard (Project Private Key).
const DEFAULT_TEBEX_BASE = 'https://headless.tebex.io/api';

const normalizePrice = (value) => {
  if (value == null) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const mapProduct = (item, fallbackCurrency) => {
  // Headless listings payload typically includes: id, name, description, price.amount, price.currency, image.src, category.name
  const price =
    normalizePrice(item?.sale?.discounted_price) ||
    normalizePrice(item?.sale?.price) ||
    normalizePrice(item?.base_price ?? item?.price?.amount ?? item?.price);

  const image =
    item?.image?.src ?? item?.image_url ?? item?.image ?? null;

  return {
    id: item?.id ?? item?.package_id ?? item?.identifier ?? item?.listing_id,
    name: item?.name ?? item?.package_name ?? 'Untitled product',
    description: item?.description ?? item?.short_description ?? '',
    image,
    category: item?.category?.name ?? item?.category ?? item?.category_id ?? 'General',
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
      'USD',
    recurring:
      item?.expiry_length && item?.expiry_period
        ? `${item.expiry_length} ${item.expiry_period}`
        : null,
  };
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { Allow: 'GET' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const tebexSecret = process.env.TEBEX_API_SECRET || process.env.TEBEX_HEADLESS_KEY;
  const tebexBase = (process.env.TEBEX_HEADLESS_BASE || process.env.TEBEX_API_BASE || DEFAULT_TEBEX_BASE).replace(/\/$/, '');

  if (!tebexSecret) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Missing TEBEX_API_SECRET/TEBEX_HEADLESS_KEY environment variable. Set it in Netlify.',
      }),
    };
  }

  try {
    // Headless listings endpoint
    const response = await fetch(`${tebexBase}/listings`, {
      headers: {
        'X-Tebex-Secret': tebexSecret,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const details = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: 'Failed to fetch products from Tebex',
          details,
        }),
      };
    }

    const payload = await response.json();
    const packages = payload?.data ?? payload?.packages ?? payload ?? [];
    const fallbackCurrency =
      payload?.currency?.iso_4217 ?? payload?.currency ?? payload?.price?.currency;

    const products = Array.isArray(packages)
      ? packages
          .map((pkg) => mapProduct(pkg, fallbackCurrency))
          .filter((item) => item.id != null)
      : [];

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
      body: JSON.stringify({ products }),
    };
  } catch (error) {
    console.error('Tebex product fetch failed', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Unexpected error fetching Tebex products' }),
    };
  }
};
