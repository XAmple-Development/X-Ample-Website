const DEFAULT_TEBEX_BASE = "https://headless.tebex.io/api";

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    // Helps with some setups/tools:
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
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

exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const accountToken = process.env.TEBEX_ACCOUNT_TOKEN; // vg3c-...
  const authHeader = getAuthHeader();
  const tebexBase = (process.env.TEBEX_HEADLESS_BASE || DEFAULT_TEBEX_BASE).replace(/\/$/, "");

  if (!accountToken) return json(500, { error: "Missing TEBEX_ACCOUNT_TOKEN" });
  if (!authHeader) return json(500, { error: "Missing TEBEX_PROJECT_ID or TEBEX_PRIVATE_KEY" });

  let body;
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return json(400, { error: "Invalid JSON body" });
  }

  const {
    items = [],                 // [{ productId, quantity }]
    ident: providedIdent,        // reuse basket if you want
    authOnly = false,
    returnUrl,
    cancelUrl,
  } = body;

  const resolvedReturn = returnUrl || `${process.env.URL || ""}/store?status=success`;
  const resolvedCancel = cancelUrl || `${process.env.URL || ""}/store?status=cancelled`;

  // OPTIONAL SAFER DEFAULT (recommended):
  // const resolvedReturn = returnUrl || `${process.env.URL || ""}/store`;

  const headers = {
    "Content-Type": "application/json",
    Authorization: authHeader,
  };

  // Where to send the user AFTER they finish Tebex Identity login.
  // Prefer the caller-provided returnUrl (frontend passes a full origin URL),
  // but fall back to your site store page.
  const loginReturnUrl = returnUrl || `${process.env.URL || ""}/store?cart=1`;

  const getAuthUrl = async (ident) => {
    const url = `${tebexBase}/accounts/${accountToken}/baskets/${ident}/auth?returnUrl=${encodeURIComponent(
      loginReturnUrl
    )}`;

    const authRes = await fetch(url, { headers: { Authorization: authHeader } });

    if (!authRes.ok) {
      return { ok: false, status: authRes.status, details: await authRes.text() };
    }

    const authOptions = await authRes.json();
    const firstUrl = Array.isArray(authOptions) ? authOptions[0]?.url : authOptions?.url;

    return { ok: true, authUrl: firstUrl || null, authOptions };
  };

  const getBasket = async (ident) => {
    const res = await fetch(`${tebexBase}/accounts/${accountToken}/baskets/${ident}`, {
      headers: { Authorization: authHeader },
    });
    if (!res.ok) {
      return { ok: false, status: res.status, details: await res.text() };
    }
    const data = await res.json();
    return { ok: true, data };
  };

  const addPackage = async (ident, productId, quantity) => {
    // Correct endpoint:
    const res = await fetch(`${tebexBase}/baskets/${ident}/packages`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        package_id: Number(productId),
        quantity: Number(quantity) || 1,
      }),
    });

    if (!res.ok) {
      return { ok: false, status: res.status, details: await res.text() };
    }

    const data = await res.json();
    return { ok: true, data };
  };

  try {
    // 1) Create basket if no ident provided
    let ident = providedIdent;
    if (!ident) {
      const basketRes = await fetch(`${tebexBase}/accounts/${accountToken}/baskets`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          complete_url: resolvedReturn,
          cancel_url: resolvedCancel,
        }),
      });

      if (!basketRes.ok) {
        return json(basketRes.status, {
          error: "Failed to create basket",
          details: await basketRes.text(),
        });
      }

      const basketData = await basketRes.json();
      ident = basketData?.data?.ident || basketData?.ident;

      if (!ident) return json(500, { error: "Basket created but ident missing", basket: basketData });
    }

    // 2) If authOnly, just return auth URL
    if (authOnly) {
      const auth = await getAuthUrl(ident);
      if (!auth.ok) return json(auth.status, { error: "Failed to fetch auth URL", details: auth.details, ident });
      return json(200, { ident, authUrl: auth.authUrl, authOptions: auth.authOptions, loginRequired: true });
    }

    // 3) Try add items (if any)
    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        const productId = item?.productId;
        if (!productId) continue;

        const add = await addPackage(ident, productId, item?.quantity);

        // If user isn't authenticated yet, return auth URL
        if (!add.ok && add.status === 422 && String(add.details).toLowerCase().includes("must login")) {
          const auth = await getAuthUrl(ident);
          if (!auth.ok) return json(auth.status, { error: "Login required, but auth URL failed", details: auth.details, ident });
          return json(200, { ident, authUrl: auth.authUrl, loginRequired: true });
        }

        if (!add.ok) {
          return json(add.status, { error: "Failed to add package to basket", details: add.details, ident, productId });
        }
      }
    }

    // 4) Fetch basket to get checkout URL
    const basket = await getBasket(ident);
    if (!basket.ok) return json(basket.status, { error: "Failed to fetch basket", details: basket.details, ident });

    const b = basket.data?.data || basket.data;
    const checkoutUrl = b?.links?.checkout || basket.data?.links?.checkout || b?.checkout_url || basket.data?.checkout_url || null;

    const count = Array.isArray(b?.packages)
      ? b.packages.reduce((sum, p) => sum + (Number(p?.in_basket?.quantity) || 0), 0)
      : 0;

    return json(200, {
      ident,
      checkoutUrl,
      count,
      usernameId: b?.username_id || null,
      username: b?.username || null,
      basket: b,
      loginRequired: false,
    });
  } catch (err) {
    console.error("tebex-basket error", err);
    return json(500, { error: "Unexpected Tebex error", details: String(err?.message || err) });
  }
};
