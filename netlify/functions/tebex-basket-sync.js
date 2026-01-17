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

  const { items = [], usernameId, returnUrl, cancelUrl, sessionToken } = body;
  if (!Array.isArray(items) || items.length === 0) return json(400, { error: "items are required" });

  const resolvedReturn = returnUrl || `${process.env.URL || ""}/store?status=success`;
  const resolvedCancel = cancelUrl || `${process.env.URL || ""}/store?status=cancelled`;

  let resolvedUsernameId = usernameId;

  if (!resolvedUsernameId && sessionToken) {
    const { createClient } = require("@supabase/supabase-js");
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return json(500, { error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" });
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { data, error } = await supabase
      .from("tebex_login_sessions")
      .select("username_id, expires_at")
      .eq("session_token", String(sessionToken))
      .limit(1)
      .maybeSingle();
    if (error) return json(500, { error: "Failed to fetch login session", details: error.message });
    if (!data || !data.username_id) {
      return json(409, { error: "Login pending", details: "No username_id stored yet." });
    }
    if (data.expires_at && Date.parse(data.expires_at) < Date.now()) {
      return json(409, { error: "Login expired", details: "Login session expired, please login again." });
    }
    resolvedUsernameId = data.username_id;
  }

  if (!resolvedUsernameId) return json(400, { error: "usernameId is required (login first)" });

  let basketIdent;

  try {
    const basketRes = await fetch(`${tebexBase}/accounts/${accountToken}/baskets`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: authHeader },
      body: JSON.stringify({
        complete_url: resolvedReturn,
        cancel_url: resolvedCancel,
        username_id: usernameId,
      }),
    });
    if (!basketRes.ok) {
      return json(basketRes.status, {
        error: "Failed to create basket",
        details: await basketRes.text(),
      });
    }
    const basketData = await basketRes.json();
    basketIdent = basketData?.data?.ident || basketData?.ident;

    // Add each item
    for (const item of items) {
      const addRes = await fetch(
        `${tebexBase}/accounts/${accountToken}/baskets/${basketIdent}/packages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: authHeader },
          body: JSON.stringify({
            package_id: Number(item.productId),
            quantity: Number(item.quantity) || 1,
        username_id: resolvedUsernameId,
          }),
        }
      );
      if (!addRes.ok) {
        return json(addRes.status, {
          error: "Failed to add package to basket",
          details: await addRes.text(),
          ident: basketIdent,
        });
      }
    }

    const basketGet = await fetch(`${tebexBase}/accounts/${accountToken}/baskets/${basketIdent}`, {
      headers: { Authorization: authHeader },
    });
    if (!basketGet.ok) {
      return json(basketGet.status, {
        error: "Failed to fetch basket",
        details: await basketGet.text(),
        ident: basketIdent,
      });
    }

    const basketDetails = await basketGet.json();
    const packages = basketDetails?.data?.packages || [];
    const count = packages.reduce((sum, p) => sum + (Number(p?.qty) || 0), 0);
    const checkoutUrl =
      basketDetails?.data?.links?.checkout ||
      basketDetails?.links?.checkout ||
      basketDetails?.data?.checkout_url ||
      basketDetails?.checkout_url ||
      null;
    return json(200, { ident: basketIdent, count, checkoutUrl });
  } catch (err) {
    console.error("tebex-basket-sync error", err);
    return json(500, { error: "Unexpected Tebex error", details: String(err?.message || err) });
  }
};
