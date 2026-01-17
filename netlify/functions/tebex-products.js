const DEFAULT_TEBEX_BASE = 'https://plugin.tebex.io';

const normalizePrice = (value) => {
  if (value == null) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const mapProduct = (pkg, fallbackCurrency) => {
  const price =
    normalizePrice(pkg?.sale?.discounted_price) ||
    normalizePrice(pkg?.sale?.price) ||
    normalizePrice(pkg?.base_price ?? pkg?.price?.amount ?? pkg?.price);

  return {
    id: pkg?.id ?? pkg?.package_id ?? pkg?.identifier ?? pkg?.listing_id,
    name: pkg?.name ?? pkg?.package_name ?? 'Untitled product',
    description: pkg?.description ?? pkg?.short_description ?? '',
    image: pkg?.image ?? pkg?.image_url ?? null,
    category: pkg?.category?.name ?? pkg?.category ?? pkg?.category_id ?? 'General',
    price,
    salePrice:
      pkg?.sale?.discounted_price != null || pkg?.sale?.price != null
        ? normalizePrice(pkg?.sale?.discounted_price ?? pkg?.sale?.price)
        : null,
    currency:
      pkg?.currency?.iso_4217 ??
      pkg?.currency ??
      fallbackCurrency ??
      pkg?.price?.currency ??
      'USD',
    recurring:
      pkg?.expiry_length && pkg?.expiry_period
        ? `${pkg.expiry_length} ${pkg.expiry_period}`
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

  const tebexSecret = process.env.TEBEX_API_SECRET;
  const tebexBase = (process.env.TEBEX_API_BASE || DEFAULT_TEBEX_BASE).replace(/\/$/, '');

  if (!tebexSecret) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Missing TEBEX_API_SECRET environment variable. Set it in Netlify.',
      }),
    };
  }

  try {
    const response = await fetch(`${tebexBase}/packages`, {
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
    const packages = payload?.packages ?? payload?.data ?? payload ?? [];
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
