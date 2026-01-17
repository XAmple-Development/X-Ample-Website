const DEFAULT_TEBEX_BASE = 'https://headless.tebex.io/api';
const DEFAULT_RETURN = process.env.URL || 'http://localhost:8888';

const jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  if (event.httpMethod === 'GET') {
    return jsonResponse(200, { ok: true, message: 'Use POST with productId to create a Tebex basket.' });
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { Allow: 'POST, GET' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const accountToken = process.env.TEBEX_ACCOUNT_TOKEN;
  const headlessSecret = process.env.TEBEX_HEADLESS_KEY || process.env.TEBEX_API_SECRET;
  const tebexBase = (process.env.TEBEX_HEADLESS_BASE || DEFAULT_TEBEX_BASE).replace(/\/$/, '');

  if (!accountToken && !headlessSecret) {
    return jsonResponse(500, {
      error: 'Missing Tebex credentials. Set TEBEX_ACCOUNT_TOKEN (recommended) or TEBEX_HEADLESS_KEY.',
    });
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

  const tryAccountToken = async () => {
    if (!accountToken) return null;

    // 1) Create basket with token in path, no secret header
    const basketRes = await fetch(`${tebexBase}/accounts/${accountToken}/baskets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        return_url: resolvedReturn,
        cancel_url: resolvedCancel,
        complete_url: resolvedReturn,
      }),
    });
    if (!basketRes.ok) {
      return { error: true, status: basketRes.status, details: await basketRes.text() };
    }
    const basket = await basketRes.json();
    const basketId = basket?.data?.ident || basket?.ident || basket?.id || basket?.identifier;
    if (!basketId) return { error: true, status: 500, details: 'Missing basket id' };

    // 2) Add package
    const addPkgRes = await fetch(`${tebexBase}/accounts/${accountToken}/baskets/${basketId}/packages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        package_id: productId,
        quantity,
        username: playerName || undefined,
      }),
    });
    if (!addPkgRes.ok) {
      return { error: true, status: addPkgRes.status, details: await addPkgRes.text() };
    }

    // 3) Email (best-effort)
    if (email) {
      try {
        await fetch(`${tebexBase}/accounts/${accountToken}/baskets/${basketId}/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
      } catch (err) {
        console.warn('Failed to set email on basket', err);
      }
    }

    // 4) Fetch basket to get checkout link
    const basketGetRes = await fetch(`${tebexBase}/accounts/${accountToken}/baskets/${basketId}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    const basketDetails = basketGetRes.ok ? await basketGetRes.json() : {};
    const checkoutUrl =
      basketDetails?.data?.links?.checkout ||
      basketDetails?.links?.checkout ||
      basketDetails?.checkout_url ||
      basketDetails?.data?.checkout_url;

    if (!checkoutUrl) {
      return { error: true, status: 500, details: 'Missing checkout URL from basket' };
    }

    return { error: false, checkoutUrl, basketId };
  };

  const trySecret = async () => {
    if (!headlessSecret) return null;

    const basketRes = await fetch(`${tebexBase}/baskets`, {
      method: 'POST',
      headers: {
        'X-Tebex-Secret': headlessSecret,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        return_url: resolvedReturn,
        cancel_url: resolvedCancel,
        complete_url: resolvedReturn,
      }),
    });
    if (!basketRes.ok) {
      return { error: true, status: basketRes.status, details: await basketRes.text() };
    }
    const basket = await basketRes.json();
    const basketId = basket?.id || basket?.identifier || basket?.ident || basket?.data?.id;
    if (!basketId) return { error: true, status: 500, details: 'Missing basket id' };

    const addPkgRes = await fetch(`${tebexBase}/baskets/${basketId}/packages`, {
      method: 'POST',
      headers: {
        'X-Tebex-Secret': headlessSecret,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        package_id: productId,
        quantity,
        username: playerName || undefined,
      }),
    });
    if (!addPkgRes.ok) {
      return { error: true, status: addPkgRes.status, details: await addPkgRes.text() };
    }

    if (email) {
      try {
        await fetch(`${tebexBase}/baskets/${basketId}/email`, {
          method: 'POST',
          headers: {
            'X-Tebex-Secret': headlessSecret,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });
      } catch (err) {
        console.warn('Failed to set email on basket (secret flow)', err);
      }
    }

    const basketGetRes = await fetch(`${tebexBase}/baskets/${basketId}`, {
      headers: { 'X-Tebex-Secret': headlessSecret },
    });
    const basketDetails = basketGetRes.ok ? await basketGetRes.json() : {};
    const checkoutUrl =
      basketDetails?.links?.checkout ||
      basketDetails?.checkout_url ||
      basketDetails?.data?.links?.checkout ||
      basketDetails?.data?.checkout_url;

    if (!checkoutUrl) {
      return { error: true, status: 500, details: 'Missing checkout URL from basket (secret flow)' };
    }

    return { error: false, checkoutUrl, basketId };
  };

  try {
    const tokenResult = await tryAccountToken();
    if (tokenResult && !tokenResult.error) {
      return jsonResponse(200, { checkoutUrl: tokenResult.checkoutUrl, basketId: tokenResult.basketId });
    }

    const secretResult = await trySecret();
    if (secretResult && !secretResult.error) {
      return jsonResponse(200, { checkoutUrl: secretResult.checkoutUrl, basketId: secretResult.basketId });
    }

    const failure = tokenResult?.error ? tokenResult : secretResult;
    return jsonResponse(failure?.status || 500, {
      error: 'Failed to create Tebex basket',
      details: failure?.details || 'Unknown error',
    });
  } catch (error) {
    console.error('Tebex checkout creation failed', error);
    return jsonResponse(500, { error: 'Unexpected error creating Tebex checkout' });
  }
};
