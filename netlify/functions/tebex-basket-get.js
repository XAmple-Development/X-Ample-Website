// netlify/functions/tebex-basket-get.js

const DEFAULT_TEBEX_BASE = "https://headless.tebex.io/api";

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
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
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "GET") {
    return json(405, { error: "Method not allowed" });
  }

  const accountToken = process.env.TEBEX_ACCOUNT_TOKEN; // vg3c-...
  const authHeader = getAuthHeader();
  const tebexBase = (process.env.TEBEX_HEADLESS_BASE || DEFAULT_TEBEX_BASE).replace(/\/$/, "");

  if (!accountToken) return json(500, { error: "Missing TEBEX_ACCOUNT_TOKEN" });
  if (!authHeader) return json(500, { error: "Missing TEBEX_PROJECT_ID or TEBEX_PRIVATE_KEY" });

  const ident = event.queryStringParameters?.ident;
  if (!ident) return json(400, { error: "Missing ident" });

  try {
    const res = await fetch(`${tebexBase}/accounts/${accountToken}/baskets/${encodeURIComponent(ident)}`, {
      headers: { Authorization: authHeader },
    });

    if (!res.ok) {
      return json(res.status, {
        error: "Failed to fetch basket",
        details: await res.text(),
      });
    }

    const payload = await res.json();
    const b = payload?.data || payload;

    // Normalise the packages a bit (different responses use different fields)
    const packages = Array.isArray(b?.packages) ? b.packages : [];
    const count = packages.reduce((sum, p) => {
      // In many Headless responses, quantity is in p.in_basket.quantity
      const qty = Number(p?.in_basket?.quantity ?? p?.qty ?? p?.quantity ?? 0);
      return sum + (Number.isFinite(qty) ? qty : 0);
    }, 0);

    const checkoutUrl =
      b?.links?.checkout ||
      payload?.links?.checkout ||
      b?.checkout_url ||
      payload?.checkout_url ||
      (b?.ident ? `https://pay.tebex.io/${b.ident}` : null);

    return json(200, {
      ident: b?.ident || ident,
      complete: !!b?.complete,
      currency: b?.currency || null,
      base_price: b?.base_price ?? null,
      sales_tax: b?.sales_tax ?? null,
      total_price: b?.total_price ?? null,
      username_id: b?.username_id ?? null,
      username: b?.username ?? null,
      count,
      packages,
      checkoutUrl,
      basket: b,
    });
  } catch (err) {
    return json(500, { error: "Unexpected Tebex error", details: String(err?.message || err) });
  }
};
