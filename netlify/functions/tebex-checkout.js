// tebex-checkout.js (Netlify Function)
//
// POST JSON:
// {
//   "productId": 7208967,
//   "quantity": 1,
//   "playerName": "test",               // accepted by your API, but NOT sent to Tebex (some game types disallow username)
//   "email": "test@example.com",        // optional (not always supported to pre-set in Headless)
//   "returnUrl": "https://yoursite.com/store?status=success",   // optional
//   "cancelUrl": "https://yoursite.com/store?status=cancelled"  // optional
// }
//
// REQUIRED ENV VARS (Tebex Headless API):
// - TEBEX_ACCOUNT_TOKEN   (webstore token like t66x-...)
// - TEBEX_PROJECT_ID      (Project ID for Basic auth username)
// - TEBEX_PRIVATE_KEY     (Private Key for Basic auth password)
//
// Optional ENV VARS:
// - TEBEX_HEADLESS_BASE   (default: https://headless.tebex.io/api)
// - URL                   (Netlify site URL; used for default return/cancel)

const DEFAULT_TEBEX_BASE = "https://headless.tebex.io/api";
const DEFAULT_RETURN = process.env.URL || "http://localhost:8888";

const jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  },
  body: JSON.stringify(body),
});

const getClientIp = (event) => {
  const h = event.headers || {};
  return (
    h["x-nf-client-connection-ip"] ||
    (h["x-forwarded-for"] ? h["x-forwarded-for"].split(",")[0].trim() : "") ||
    undefined
  );
};

const getBasicAuthHeader = () => {
  const projectId = process.env.TEBEX_PROJECT_ID;
  const privateKey = process.env.TEBEX_PRIVATE_KEY;
  if (!projectId || !privateKey) return null;

  const token = Buffer.from(`${projectId}:${privateKey}`).toString("base64");
  return `Basic ${token}`;
};

exports.handler = async (event) => {
  // Preflight (browser)
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      },
      body: "",
    };
  }

  if (event.httpMethod === "GET") {
    return jsonResponse(200, {
      ok: true,
      message: "Use POST with productId to create a Tebex basket + checkout URL.",
    });
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { Allow: "POST, GET, OPTIONS" },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const tebexBase = (process.env.TEBEX_HEADLESS_BASE || DEFAULT_TEBEX_BASE).replace(/\/$/, "");
  const accountToken = process.env.TEBEX_ACCOUNT_TOKEN;
  const authHeader = getBasicAuthHeader();

  if (!accountToken) return jsonResponse(500, { error: "Missing env var: TEBEX_ACCOUNT_TOKEN" });
  if (!authHeader) return jsonResponse(500, { error: "Missing env vars: TEBEX_PROJECT_ID and/or TEBEX_PRIVATE_KEY" });

  let body;
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return jsonResponse(400, { error: "Invalid JSON body" });
  }

  const { productId, quantity = 1, playerName, email, returnUrl, cancelUrl } = body;

  if (!productId) return jsonResponse(400, { error: "productId is required" });

  const resolvedReturn = returnUrl || `${DEFAULT_RETURN}/store?status=success`;
  const resolvedCancel = cancelUrl || `${DEFAULT_RETURN}/store?status=cancelled`;
  const ip = getClientIp(event);

  try {
    //
    // 1) Create basket
    // IMPORTANT: Do NOT send "username" for game types that disallow it (your error confirms this).
    //
    const createBasketRes = await fetch(`${tebexBase}/accounts/${accountToken}/baskets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        complete_url: resolvedReturn,
        cancel_url: resolvedCancel,
        ip: ip || undefined,
      }),
    });

    if (!createBasketRes.ok) {
      const raw = await createBasketRes.text();
      return jsonResponse(createBasketRes.status, {
        error: "Failed to create Tebex basket",
        details: raw,
      });
    }

    const basketJson = await createBasketRes.json();
    const basketIdent = basketJson?.data?.ident || basketJson?.ident;

    if (!basketIdent) {
      return jsonResponse(500, {
        error: "Basket created but missing basket ident in response",
        details: basketJson,
      });
    }

    //
    // 2) Add package
    // IMPORTANT: Do NOT send "username" here either for your game type.
    //
    const addPackageRes = await fetch(`${tebexBase}/baskets/${basketIdent}/packages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        package_id: Number(productId),
        quantity: Number(quantity) || 1,
      }),
    });

    if (!addPackageRes.ok) {
      const raw = await addPackageRes.text();
      return jsonResponse(addPackageRes.status, {
        error: "Basket created but failed to add package",
        basketIdent,
        details: raw,
      });
    }

    //
    // 3) Fetch basket to get checkout URL
    //
    const basketGetRes = await fetch(`${tebexBase}/baskets/${basketIdent}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    });

    if (!basketGetRes.ok) {
      const raw = await basketGetRes.text();
      return jsonResponse(basketGetRes.status, {
        error: "Package added but failed to fetch basket details",
        basketIdent,
        details: raw,
      });
    }

    const basketDetails = await basketGetRes.json();
    const checkoutUrl =
      basketDetails?.data?.links?.checkout ||
      basketDetails?.links?.checkout ||
      basketDetails?.data?.checkout_url ||
      basketDetails?.checkout_url;

    if (!checkoutUrl) {
      return jsonResponse(500, {
        error: "Missing checkout URL from basket details",
        basketIdent,
        details: basketDetails,
      });
    }

    // Note: email/playerName are echoed back for your app, but not applied to Tebex here.
    return jsonResponse(200, {
      ok: true,
      basketIdent,
      checkoutUrl,
      productId: Number(productId),
      quantity: Number(quantity) || 1,
      playerName: playerName || null,
      email: email || null,
    });
  } catch (err) {
    console.error("Tebex checkout creation failed:", err);
    return jsonResponse(500, {
      error: "Unexpected error creating Tebex checkout",
      details: String(err?.message || err),
    });
  }
};
