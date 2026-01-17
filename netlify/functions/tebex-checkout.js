const DEFAULT_TEBEX_BASE = 'https://headless.tebex.io/api';
const DEFAULT_RETURN = process.env.URL || 'http://localhost:8888';

const jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { Allow: 'POST' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const tebexKey = process.env.TEBEX_API_SECRET || process.env.TEBEX_HEADLESS_KEY;
  const tebexBase = (process.env.TEBEX_HEADLESS_BASE || DEFAULT_TEBEX_BASE).replace(/\/$/, '');

  if (!tebexKey) {
    return jsonResponse(500, { error: 'Missing TEBEX_API_SECRET/TEBEX_HEADLESS_KEY env var.' });
  }

  let body;
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body' });
  }

  const { productId, quantity = 1, playerName, email, returnUrl, cancelUrl } = body;

  if (!productId) {
    return jsonResponse(400, { error: 'productId is required' });
  }

  const resolvedReturn = returnUrl || `${DEFAULT_RETURN}/store?status=success`;
  const resolvedCancel = cancelUrl || `${DEFAULT_RETURN}/store?status=cancelled`;

  try {
    // 1) Create a basket
    const basketRes = await fetch(`${tebexBase}/baskets`, {
      method: 'POST',
      headers: {
        'X-Tebex-Secret': tebexKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        return_url: resolvedReturn,
        cancel_url: resolvedCancel,
        complete_url: resolvedReturn,
      }),
    });

    if (!basketRes.ok) {
      const text = await basketRes.text();
      return jsonResponse(basketRes.status, {
        error: 'Failed to create Tebex basket',
        details: text,
      });
    }

    const basket = await basketRes.json();
    const basketId = basket?.id || basket?.identifier || basket?.ident || basket?.data?.id;

    if (!basketId) {
      return jsonResponse(500, { error: 'Missing basket id from Tebex response' });
    }

    // 2) Add package to basket
    const addPkgRes = await fetch(`${tebexBase}/baskets/${basketId}/packages`, {
      method: 'POST',
      headers: {
        'X-Tebex-Secret': tebexKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        package_id: productId,
        quantity,
        username: playerName || undefined,
      }),
    });

    if (!addPkgRes.ok) {
      const text = await addPkgRes.text();
      return jsonResponse(addPkgRes.status, {
        error: 'Failed to add package to basket',
        details: text,
      });
    }

    // 3) Optionally attach email (best-effort)
    if (email) {
      try {
        await fetch(`${tebexBase}/baskets/${basketId}/email`, {
          method: 'POST',
          headers: {
            'X-Tebex-Secret': tebexKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });
      } catch (err) {
        console.warn('Failed to set email on basket', err);
      }
    }

    // 4) Retrieve checkout link
    const basketGetRes = await fetch(`${tebexBase}/baskets/${basketId}`, {
      headers: { 'X-Tebex-Secret': tebexKey },
    });

    const basketDetails = basketGetRes.ok ? await basketGetRes.json() : {};
    const checkoutUrl =
      basketDetails?.links?.checkout ||
      basketDetails?.checkout_url ||
      basketDetails?.data?.links?.checkout ||
      basketDetails?.data?.checkout_url;

    if (!checkoutUrl) {
      return jsonResponse(500, {
        error: 'Missing checkout URL from Tebex basket',
        basket: basketDetails,
      });
    }

    return jsonResponse(200, { checkoutUrl, basketId });
  } catch (error) {
    console.error('Tebex checkout creation failed', error);
    return jsonResponse(500, { error: 'Unexpected error creating Tebex checkout' });
  }
};
