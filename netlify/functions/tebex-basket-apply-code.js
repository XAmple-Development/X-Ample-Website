// netlify/functions/tebex-basket-apply-code.js
// Applies a coupon or creator code to a Tebex basket (Headless API).
// Docs: https://docs.tebex.io/developers/headless-api/overview

const DEFAULT_TEBEX_BASE = "https://headless.tebex.io/api";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
};

const json = (statusCode, body) => ({
  statusCode,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const getAuthHeader = () => {
  const projectId = process.env.TEBEX_PROJECT_ID;
  const privateKey = process.env.TEBEX_PRIVATE_KEY;
  if (!projectId || !privateKey) return null;
  const token = Buffer.from(`${projectId}:${privateKey}`).toString("base64");
  return `Basic ${token}`;
};

const fetchBasket = async ({ tebexBase, accountToken, authHeader, ident }) => {
  const res = await fetch(`${tebexBase}/accounts/${accountToken}/baskets/${encodeURIComponent(ident)}`, {
    headers: { Authorization: authHeader },
  });
  if (!res.ok) return { ok: false, status: res.status, details: await res.text() };
  const payload = await res.json();
  const b = payload?.data || payload;

  const packages = Array.isArray(b?.packages) ? b.packages : [];
  const count = packages.reduce((sum, p) => {
    const qty = Number(p?.in_basket?.quantity ?? p?.qty ?? p?.quantity ?? 0);
    return sum + (Number.isFinite(qty) ? qty : 0);
  }, 0);

  const checkoutUrl =
    b?.links?.checkout ||
    payload?.links?.checkout ||
    b?.checkout_url ||
    payload?.checkout_url ||
    (b?.ident ? `https://checkout.tebex.io/checkout/${b.ident}` : null);

  return {
    ok: true,
    basket: b,
    count,
    checkoutUrl,
  };
};

const applyCreatorCode = async ({ tebexBase, accountToken, authHeader, ident, code }) => {
  const res = await fetch(
    `${tebexBase}/accounts/${accountToken}/baskets/${encodeURIComponent(ident)}/creator-codes`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: authHeader },
      body: JSON.stringify({ creator_code: String(code) }),
    }
  );

  if (!res.ok) return { ok: false, status: res.status, details: await res.text() };
  return { ok: true };
};

const applyCoupon = async ({ tebexBase, accountToken, authHeader, ident, code }) => {
  const res = await fetch(
    `${tebexBase}/accounts/${accountToken}/baskets/${encodeURIComponent(ident)}/coupons`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: authHeader },
      body: JSON.stringify({ coupon_code: String(code) }),
    }
  );

  if (!res.ok) return { ok: false, status: res.status, details: await res.text() };
  return { ok: true };
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

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

  const ident = body?.ident;
  const code = String(body?.code || "").trim();
  const kind = String(body?.kind || "").trim(); // "creator" | "coupon" | ""

  if (!ident) return json(400, { error: "Missing ident" });
  if (!code) return json(400, { error: "Missing code" });

  try {
    // Tebex supports both coupons and creator codes.
    // If the client doesn't specify, we try creator code first, then coupon.
    let applied = null;

    if (kind === "creator") {
      const r = await applyCreatorCode({ tebexBase, accountToken, authHeader, ident, code });
      if (!r.ok) return json(r.status, { error: "Failed to apply creator code", details: r.details });
      applied = "creator";
    } else if (kind === "coupon") {
      const r = await applyCoupon({ tebexBase, accountToken, authHeader, ident, code });
      if (!r.ok) return json(r.status, { error: "Failed to apply coupon", details: r.details });
      applied = "coupon";
    } else {
      const creatorAttempt = await applyCreatorCode({ tebexBase, accountToken, authHeader, ident, code });
      if (creatorAttempt.ok) {
        applied = "creator";
      } else {
        const couponAttempt = await applyCoupon({ tebexBase, accountToken, authHeader, ident, code });
        if (!couponAttempt.ok) {
          return json(couponAttempt.status, {
            error: "Failed to apply code",
            details: couponAttempt.details,
          });
        }
        applied = "coupon";
      }
    }

    const basket = await fetchBasket({ tebexBase, accountToken, authHeader, ident });
    if (!basket.ok) {
      return json(basket.status, { error: "Code applied but basket refresh failed", details: basket.details });
    }

    return json(200, {
      ok: true,
      applied,
      ident,
      count: basket.count,
      checkoutUrl: basket.checkoutUrl,
      basket: basket.basket,
    });
  } catch (err) {
    return json(500, { error: "Unexpected Tebex error", details: String(err?.message || err) });
  }
};

