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

  const { returnUrl, cancelUrl, usernameId } = body;
  const resolvedReturn = returnUrl || `${process.env.URL || ""}/store?status=success`;
  const resolvedCancel = cancelUrl || `${process.env.URL || ""}/store?status=cancelled`;

  try {
    const basketRes = await fetch(`${tebexBase}/accounts/${accountToken}/baskets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        complete_url: resolvedReturn,
        cancel_url: resolvedCancel,
        username_id: usernameId || undefined,
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
    const checkoutUrl =
      basketData?.data?.links?.checkout ||
      basketData?.links?.checkout ||
      basketData?.data?.checkout_url ||
      basketData?.checkout_url ||
      null;

    return json(200, { ident, checkoutUrl, basket: basketData?.data || basketData });
  } catch (err) {
    console.error("tebex-basket error", err);
    return json(500, { error: "Unexpected Tebex error", details: String(err?.message || err) });
  }
};
