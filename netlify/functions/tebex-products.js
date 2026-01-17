// Use Headless API with account token for product listings.
const DEFAULT_HEADLESS_BASE = 'https://headless.tebex.io/api';

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

  const accountToken = process.env.TEBEX_ACCOUNT_TOKEN;
  const headlessBase = (process.env.TEBEX_HEADLESS_BASE || DEFAULT_HEADLESS_BASE).replace(/\/$/, '');

  if (!accountToken) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Missing TEBEX_ACCOUNT_TOKEN. Set your webstore account token in Netlify.',
      }),
    };
  }

  try {
    const response = await fetch(`${headlessBase}/accounts/${accountToken}/packages`, {
      headers: { 'Content-Type': 'application/json' },
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
    const products = (payload?.data ?? payload?.packages ?? payload ?? [])
      .map((pkg) => mapProduct(pkg, payload?.currency?.iso_4217 ?? payload?.currency ?? payload?.price?.currency))
      .filter((item) => item.id != null);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
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
