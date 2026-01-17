const DEFAULT_TEBEX_BASE = 'https://headless.tebex.io/api';

const PAYPAL_API_BASE =
  (process.env.PAYPAL_ENV === 'live' || process.env.PAYPAL_ENV === 'production')
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

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

const fetchTebexProduct = async (productId) => {
  const accountToken = process.env.TEBEX_ACCOUNT_TOKEN;
  const tebexBase = (process.env.TEBEX_HEADLESS_BASE || DEFAULT_TEBEX_BASE).replace(/\/$/, '');

  if (!accountToken) {
    throw new Error('TEBEX_ACCOUNT_TOKEN is not set');
  }

  const response = await fetch(`${tebexBase}/accounts/${accountToken}/packages`, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Failed to load Tebex products: ${details}`);
  }

  const payload = await response.json();
  const packages = payload?.packages ?? payload?.data ?? payload ?? [];
  const fallbackCurrency =
    payload?.currency?.iso_4217 ?? payload?.currency ?? payload?.price?.currency;

  const normalized = (Array.isArray(packages) ? packages : [])
    .map((pkg) => mapProduct(pkg, fallbackCurrency))
    .filter((item) => item.id != null);

  return normalized.find((item) => String(item.id) === String(productId));
};

const getPayPalAccessToken = async () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;

  if (!clientId || !secret) {
    throw new Error('Missing PAYPAL_CLIENT_ID or PAYPAL_SECRET environment variables.');
  }

  const credentials = Buffer.from(`${clientId}:${secret}`).toString('base64');

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Failed to obtain PayPal access token: ${details}`);
  }

  const data = await response.json();
  return data?.access_token;
};

const createOrder = async (productId, customerEmail, returnUrl, cancelUrl) => {
  const product = await fetchTebexProduct(productId);

  if (!product) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Product not found in Tebex' }),
    };
  }

  const price = product.salePrice ?? product.price;
  const currency = product.currency || 'USD';

  const accessToken = await getPayPalAccessToken();

  const orderPayload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: String(product.id),
        description: product.name,
        custom_id: `${product.id}`,
        amount: {
          currency_code: currency,
          value: price.toFixed(2),
        },
      },
    ],
    application_context: {
      brand_name: 'X-Ample Studios',
      landing_page: 'NO_PREFERENCE',
      shipping_preference: 'NO_SHIPPING',
      user_action: 'PAY_NOW',
    },
  };

  if (returnUrl) {
    orderPayload.application_context.return_url = returnUrl;
  }
  if (cancelUrl) {
    orderPayload.application_context.cancel_url = cancelUrl;
  }

  if (customerEmail) {
    orderPayload.payer = { email_address: customerEmail };
  }

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderPayload),
  });

  const data = await response.json();

  return {
    statusCode: response.ok ? 200 : response.status,
    body: JSON.stringify(response.ok ? data : { error: 'Failed to create PayPal order', details: data }),
  };
};

const captureOrder = async (orderId) => {
  if (!orderId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'orderId is required' }) };
  }

  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  return {
    statusCode: response.ok ? 200 : response.status,
    body: JSON.stringify(response.ok ? data : { error: 'Failed to capture PayPal order', details: data }),
  };
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { Allow: 'POST' }, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const action = event.queryStringParameters?.action || 'create';

  try {
    const body = event.body ? JSON.parse(event.body) : {};

    if (action === 'create') {
      const { productId, customerEmail, returnUrl, cancelUrl } = body;

      if (!productId) {
        return { statusCode: 400, body: JSON.stringify({ error: 'productId is required' }) };
      }

      return await createOrder(productId, customerEmail, returnUrl, cancelUrl);
    }

    if (action === 'capture') {
      const { orderId } = body;
      return await captureOrder(orderId);
    }

    return { statusCode: 400, body: JSON.stringify({ error: 'Unknown action' }) };
  } catch (error) {
    console.error('PayPal order handler error', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Unexpected PayPal handler error', details: error.message }),
    };
  }
};
