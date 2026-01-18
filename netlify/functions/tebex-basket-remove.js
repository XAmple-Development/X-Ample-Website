// netlify/functions/tebex-basket-remove.js

const DEFAULT_TEBEX_BASE = "https://headless.tebex.io/api";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
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

exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
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

  const ident = body?.ident;
  const packageId = body?.packageId; // Tebex package id (the product/package)
  if (!ident || !packageId) return json(400, { error: "Missing ident or packageId" });

  try {
    // 1) Remove from basket (Headless uses /baskets/{ident}/packages/{packageId})
    const del = await fetch(
      `${tebexBase}/baskets/${encodeURIComponent(ident)}/packages/${encodeURIComponent(packageId)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      }
    );

    if (!del.ok) {
      return json(del.status, {
        error: "Failed to remove item",
        details: await del.text(),
      });
    }

    // 2) Fetch updated basket so UI can update immediately
    const get = await fetch(
      `${tebexBase}/accounts/${accountToken}/baskets/${encodeURIComponent(ident)}`,
      { headers: { Authorization: authHeader } }
    );

    if (!get.ok) {
      // deletion succeeded, but basket fetch failed
      return json(200, { success: true, ident, refreshed: false });
    }

    const payload = await get.json();
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
      (b?.ident ? `https://pay.tebex.io/${b.ident}` : null);

    return json(200, {
      success: true,
      ident: b?.ident || ident,
      refreshed: true,
      count,
      currency: b?.currency ?? null,
      total_price: b?.total_price ?? null,
      packages,
      checkoutUrl,
    });
  } catch (err) {
    return json(500, { error: "Unexpected error", details: String(err?.message || err) });
  }
};
