// Prefer Headless API (account token), then Headless private key, and fall back to Plugin API (server key)
const DEFAULT_HEADLESS_BASE = 'https://headless.tebex.io/api';
const DEFAULT_PLUGIN_BASE = 'https://plugin.tebex.io';

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
  const headlessSecret = process.env.TEBEX_HEADLESS_KEY || process.env.TEBEX_API_SECRET;
  const pluginSecret = process.env.TEBEX_PLUGIN_SECRET || process.env.TEBEX_API_SECRET;
  const projectId = process.env.TEBEX_PROJECT_ID;

  const headlessBase = (process.env.TEBEX_HEADLESS_BASE || DEFAULT_HEADLESS_BASE).replace(/\/$/, '');
  const pluginBase = (process.env.TEBEX_PLUGIN_BASE || DEFAULT_PLUGIN_BASE).replace(/\/$/, '');

  if (!accountToken && !headlessSecret && !pluginSecret) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Missing Tebex credentials. Set TEBEX_ACCOUNT_TOKEN (recommended), or TEBEX_HEADLESS_KEY (project private key), or TEBEX_PLUGIN_SECRET (server key).',
      }),
    };
  }

  const tryHeadlessToken = async () => {
    if (!accountToken) return null;
    const response = await fetch(`${headlessBase}/accounts/${accountToken}/packages`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      return { error: true, status: response.status, details: await response.text() };
    }
    const payload = await response.json();
    return {
      products: (payload?.data ?? payload?.packages ?? payload ?? [])
        .map((pkg) => mapProduct(pkg, payload?.currency?.iso_4217 ?? payload?.currency ?? payload?.price?.currency))
        .filter((item) => item.id != null),
    };
  };

  const tryHeadless = async () => {
    if (!headlessSecret) return null;
    const response = await fetch(`${headlessBase}/listings`, {
      headers: {
        'X-Tebex-Secret': headlessSecret,
        ...(projectId ? { 'X-Tebex-Project': projectId } : {}),
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      return { error: true, status: response.status, details: await response.text() };
    }
    const payload = await response.json();
    return {
      products: (payload?.data ?? payload?.packages ?? payload ?? [])
        .map((pkg) => mapProduct(pkg, payload?.currency?.iso_4217 ?? payload?.currency ?? payload?.price?.currency))
        .filter((item) => item.id != null),
    };
  };

  const tryPlugin = async () => {
    if (!pluginSecret) return null;
    const response = await fetch(`${pluginBase}/packages`, {
      headers: {
        'X-Tebex-Secret': pluginSecret,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      return { error: true, status: response.status, details: await response.text() };
    }
    const payload = await response.json();
    return {
      products: (payload?.packages ?? payload?.data ?? payload ?? [])
        .map((pkg) => mapProduct(pkg, payload?.currency?.iso_4217 ?? payload?.currency ?? payload?.price?.currency))
        .filter((item) => item.id != null),
    };
  };

  try {
    // 1) Try Headless account token path (most reliable for listings)
    const tokenResult = await tryHeadlessToken();
    if (tokenResult && !tokenResult.error) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
        body: JSON.stringify({ products: tokenResult.products }),
      };
    }

    // 2) Try headless secret listings
    const headlessResult = await tryHeadless();
    if (headlessResult && !headlessResult.error) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
        body: JSON.stringify({ products: headlessResult.products }),
      };
    }

    // 3) Fallback to plugin packages
    const pluginResult = await tryPlugin();
    if (pluginResult && !pluginResult.error) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
        body: JSON.stringify({ products: pluginResult.products }),
      };
    }

    // If all failed, report token error first, then headless, then plugin
    const failure = tokenResult?.error
      ? tokenResult
      : headlessResult?.error
        ? headlessResult
        : pluginResult;
    return {
      statusCode: failure?.status || 500,
      body: JSON.stringify({
        error: 'Failed to fetch products from Tebex',
        details: failure?.details || 'Unknown error',
      }),
    };
  } catch (error) {
    console.error('Tebex product fetch failed', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Unexpected error fetching Tebex products' }),
    };
  }
};
