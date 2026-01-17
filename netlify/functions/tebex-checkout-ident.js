const DEFAULT_TEBEX_BASE = "https://headless.tebex.io/api";

const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
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

  const accountToken = process.env.TEBEX_ACCOUNT_TOKEN;
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

  const { productId, quantity = 1, returnUrl, cancelUrl, usernameId } = body;
  if (!productId) return json(400, { error: "productId is required" });
  if (!usernameId) return json(400, { error: "usernameId is required (login first)" });

  const resolvedReturn = returnUrl || `${process.env.URL || ""}/store?status=success`;
  const resolvedCancel = cancelUrl || `${process.env.URL || ""}/store?status=cancelled`;

  try {
    // Create basket
    const basketRes = await fetch(`${tebexBase}/accounts/${accountToken}/baskets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
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
    const ident = basketData?.data?.ident || basketData?.ident;
    if (!ident) return json(500, { error: "Missing basket ident", details: basketData });

    // Add package
    // Add package (no account prefix needed when using ident)
    const addPkgRes = await fetch(`${tebexBase}/accounts/${accountToken}/baskets/${ident}/packages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        package_id: Number(productId),
        quantity: Number(quantity) || 1,
        username_id: usernameId || undefined,
      }),
    });

    if (!addPkgRes.ok) {
      return json(addPkgRes.status, {
        error: "Failed to add package to basket",
        details: await addPkgRes.text(),
        ident,
      });
    }

    // Fetch basket to get checkout link
    const basketGet = await fetch(`${tebexBase}/accounts/${accountToken}/baskets/${ident}`, {
      headers: { Authorization: authHeader },
    });

    if (!basketGet.ok) {
      return json(basketGet.status, {
        error: "Failed to fetch basket after adding package",
        details: await basketGet.text(),
        ident,
      });
    }

    const basketDetails = await basketGet.json();
    const checkoutUrl =
      basketDetails?.data?.links?.checkout ||
      basketDetails?.links?.checkout ||
      basketDetails?.data?.checkout_url ||
      basketDetails?.checkout_url;

    if (!checkoutUrl) {
      return json(500, { error: "Missing checkout URL from basket", ident, basketDetails });
    }

    return json(200, { ident, checkoutUrl });
  } catch (err) {
    console.error("tebex-checkout-ident error", err);
    return json(500, { error: "Unexpected Tebex error", details: String(err?.message || err) });
  }
};
