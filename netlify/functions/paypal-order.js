const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

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

const getSupabaseClient = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
};

const getMailer = () => {
  const host = process.env.SMTP_HOST || 'mail.zvapor.xyz';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port,
    secure: false,
    requireTLS: true,
    auth: { user, pass },
  });
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

const fetchTebexProducts = async () => {
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

  return (Array.isArray(packages) ? packages : [])
    .map((pkg) => mapProduct(pkg, fallbackCurrency))
    .filter((item) => item.id != null);
};

const fetchTebexProduct = async (productId) => {
  const products = await fetchTebexProducts();
  return products.find((item) => String(item.id) === String(productId));
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

const createOrder = async (productId, items, customerEmail, returnUrl, cancelUrl) => {
  let lineItems = [];
  let currency = 'USD';

  if (Array.isArray(items) && items.length > 0) {
    const products = await fetchTebexProducts();
    const productMap = new Map(products.map((item) => [String(item.id), item]));
    lineItems = items.map((item) => {
      const product = productMap.get(String(item.productId));
      if (!product) {
        throw new Error(`Product not found in Tebex: ${item.productId}`);
      }
      const unitPrice = product.salePrice ?? product.price;
      if (lineItems.length === 0) currency = product.currency || currency;
      if ((product.currency || currency) !== currency) {
        throw new Error('Mixed currencies in cart are not supported.');
      }
      return {
        name: product.name,
        unit_amount: {
          currency_code: currency,
          value: unitPrice.toFixed(2),
        },
        quantity: String(item.quantity || 1),
        sku: String(product.id),
      };
    });
  } else {
    const product = await fetchTebexProduct(productId);
    if (!product) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Product not found in Tebex' }),
      };
    }
    const unitPrice = product.salePrice ?? product.price;
    currency = product.currency || 'USD';
    lineItems = [
      {
        name: product.name,
        unit_amount: { currency_code: currency, value: unitPrice.toFixed(2) },
        quantity: '1',
        sku: String(product.id),
      },
    ];
  }

  const total = lineItems.reduce((sum, item) => {
    return sum + Number(item.unit_amount.value) * Number(item.quantity);
  }, 0);

  const accessToken = await getPayPalAccessToken();

  const orderPayload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        description: 'X-Ample Studios Order',
        amount: {
          currency_code: currency,
          value: total.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: currency,
              value: total.toFixed(2),
            },
          },
        },
        items: lineItems,
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

  if (response.ok) {
    try {
      const purchaseUnit = data?.purchase_units?.[0];
      const capture = purchaseUnit?.payments?.captures?.[0];
      const productId = purchaseUnit?.custom_id || purchaseUnit?.reference_id;
      const payerEmail = data?.payer?.email_address || data?.payer?.email || null;
      const amount = capture?.amount?.value || purchaseUnit?.amount?.value || null;
      const currency = capture?.amount?.currency_code || purchaseUnit?.amount?.currency_code || null;

      // Log to Supabase (best-effort)
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('orders').insert([
          {
            paypal_order_id: orderId,
            product_id: productId ? String(productId) : null,
            payer_email: payerEmail,
            amount,
            currency,
            status: data?.status || 'COMPLETED',
            raw_payload: data,
          },
        ]);
      }

      // Send confirmation emails (best-effort)
      const mailer = getMailer();
      if (mailer && payerEmail) {
        let productName = 'Tebex Product';
        try {
          if (productId) {
            const product = await fetchTebexProduct(productId);
            if (product?.name) productName = product.name;
          }
        } catch {
          // ignore product lookup failure
        }

        const from = process.env.MAIL_FROM || 'no-reply@x-ampledevelopment.co.uk';
        const toAdmin = process.env.MAIL_TO || 'info@x-ampledevelopment.co.uk';

        await mailer.sendMail({
          from,
          to: toAdmin,
          subject: `New PayPal Order: ${productName}`,
          html: `
            <h2>New PayPal Order</h2>
            <p><strong>Product:</strong> ${productName}</p>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Payer Email:</strong> ${payerEmail}</p>
            <p><strong>Amount:</strong> ${amount || 'N/A'} ${currency || ''}</p>
          `,
        });

        await mailer.sendMail({
          from,
          to: payerEmail,
          subject: 'Your X-Ample Studios order confirmation',
          html: `
            <h2>Thanks for your purchase!</h2>
            <p>We’ve received your PayPal payment.</p>
            <p><strong>Product:</strong> ${productName}</p>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Amount:</strong> ${amount || 'N/A'} ${currency || ''}</p>
            <p>We’ll follow up if we need anything else.</p>
          `,
        });
      }
    } catch (err) {
      console.error('Post-capture processing failed', err);
    }
  }

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
      const { productId, items, customerEmail, returnUrl, cancelUrl } = body;

      if (!productId && (!Array.isArray(items) || items.length === 0)) {
        return { statusCode: 400, body: JSON.stringify({ error: 'productId or items are required' }) };
      }

      return await createOrder(productId, items, customerEmail, returnUrl, cancelUrl);
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
