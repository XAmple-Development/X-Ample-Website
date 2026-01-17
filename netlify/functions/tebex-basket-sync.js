const DEFAULT_TEBEX_BASE = "https://headless.tebex.io/api";

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
  body: JSON.stringify(body),
});

const corsPreflight = () => ({
  statusCode: 204,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  },
  body: "",
});

const getAuthHeader = () => {
  const projectId = process.env.TEBEX_PROJECT_ID;
  const privateKey = process.env.TEBEX_PRIVATE_KEY;
  if (!projectId || !privateKey) return null;
  const token = Buffer.from(`${projectId}:${privateKey}`).toString("base64");
  return `Basic ${token}`;
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return corsPreflight();
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

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
    items = [], // [{ productId, quantity }]
    usernameId, // optional manual
    returnUrl,
    cancelUrl,
    sessionToken, // optional (your supabase mapping)
    ident,
    authOnly,
  } = body;

  if (!authOnly && !Array.isArray(items)) return json(400, { error: "items must be an array" });

  const resolvedReturn = returnUrl || `${process.env.URL || ""}/store?status=success`;
  const resolvedCancel = cancelUrl || `${process.env.URL || ""}/store?status=cancelled`;

  // Optional: resolve username_id via Supabase sessionToken
  let resolvedUsernameId = usernameId;

  if (!resolvedUsernameId && sessionToken) {
    try {
      const { createClient } = require("@supabase/supabase-js");
      const url = process.env.SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (url && key) {
        const supabase = createClient(url, key, { auth: { persistSession: false } });

        const { data, error } = await supabase
          .from("tebex_login_sessions")
          .select("username_id, expires_at")
          .eq("session_token", String(sessionToken))
          .limit(1)
          .maybeSingle();

        if (!error && data?.expires_at && Date.parse(data.expires_at) < Date.now()) {
          return json(409, { error: "Login expired", details: "Login session expired, please login again." });
        }

        if (!error && data?.username_id) resolvedUsernameId = data.username_id;
      }
    } catch {
      // ignore supabase failures; headless auth flow can still work
    }
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: authHeader,
  };

  const createBasket = async () => {
    const res = await fetch(`${tebexBase}/accounts/${accountToken}/baskets`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        complete_url: resolvedReturn,
        cancel_url: resolvedCancel,
      }),
    });

    if (!res.ok) return { ok: false, status: res.status, details: await res.text() };
    const data = await res.json();
    const ident = data?.data?.ident || data?.ident || null;
    return { ok: true, ident, data };
  };

  const getAuthUrl = async (basketIdent) => {
    const res = await fetch(
      `${tebexBase}/accounts/${accountToken}/baskets/${basketIdent}/auth?returnUrl=${encodeURIComponent(
        resolvedReturn
      )}`,
      { headers: { Authorization: authHeader } }
    );

    if (!res.ok) return { ok: false, status: res.status, details: await res.text() };

    const options = await res.json();
    const authUrl = Array.isArray(options) ? options[0]?.url : options?.url;

    return { ok: true, authUrl: authUrl || null, options };
  };

  const addPackage = async (basketIdent, productId, quantity) => {
    // ✅ correct endpoint (this is the one that worked in your curl)
    const res = await fetch(`${tebexBase}/baskets/${basketIdent}/packages`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        package_id: Number(productId),
        quantity: Number(quantity) || 1,
        // only include username_id if we have it (optional)
        ...(resolvedUsernameId ? { username_id: resolvedUsernameId } : {}),
      }),
    });

    if (!res.ok) return { ok: false, status: res.status, details: await res.text() };
    const data = await res.json();
    return { ok: true, data };
  };

  const fetchBasket = async (basketIdent) => {
    const res = await fetch(`${tebexBase}/accounts/${accountToken}/baskets/${basketIdent}`, {
      headers: { Authorization: authHeader },
    });

    if (!res.ok) return { ok: false, status: res.status, details: await res.text() };
    const data = await res.json();
    return { ok: true, data };
  };

  try {
    // 1) Ensure we have a basket ident
    let basketIdent = ident || null;

    if (!basketIdent) {
      const created = await createBasket();
      if (!created.ok) return json(created.status, { error: "Failed to create basket", details: created.details });
      basketIdent = created.ident;
      if (!basketIdent) return json(500, { error: "Basket created but ident missing", debug: created.data });
    }

    // 2) If authOnly, return authUrl to start login (this is what Store.handleLogin expects)
    if (authOnly) {
      const auth = await getAuthUrl(basketIdent);
      if (!auth.ok) return json(auth.status, { error: "Failed to fetch auth URL", details: auth.details, ident: basketIdent });

      return json(200, {
        ident: basketIdent,
        authUrl: auth.authUrl,
        loginRequired: true,
      });
    }

    // 3) Add items
    for (const item of items) {
      const productId = item?.productId;
      if (!productId) continue;

      const added = await addPackage(basketIdent, productId, item?.quantity);

      // If Tebex says user must login -> return authUrl
      if (!added.ok && added.status === 422 && String(added.details).toLowerCase().includes("must login")) {
        const auth = await getAuthUrl(basketIdent);
        if (!auth.ok) return json(auth.status, { error: "Login required, but auth URL failed", details: auth.details, ident: basketIdent });

        return json(200, {
          ident: basketIdent,
          authUrl: auth.authUrl,
          loginRequired: true,
        });
      }

      if (!added.ok) {
        return json(added.status, {
          error: "Failed to add package to basket",
          details: added.details,
          ident: basketIdent,
          productId,
        });
      }
    }

    // 4) Fetch basket so we can return checkoutUrl + count
    const basket = await fetchBasket(basketIdent);
    if (!basket.ok) return json(basket.status, { error: "Failed to fetch basket", details: basket.details, ident: basketIdent });

    const b = basket.data?.data || basket.data;

    const checkoutUrl =
      b?.links?.checkout ||
      basket.data?.links?.checkout ||
      b?.checkout_url ||
      basket.data?.checkout_url ||
      null;

    const count = Array.isArray(b?.packages)
      ? b.packages.reduce((sum, p) => sum + (Number(p?.in_basket?.quantity) || Number(p?.qty) || 0), 0)
      : 0;

    return json(200, {
      ident: basketIdent,
      count,
      checkoutUrl,
      usernameId: b?.username_id || null,
      username: b?.username || null,
    });
  } catch (err) {
    console.error("tebex-basket-sync error", err);
    return json(500, { error: "Unexpected Tebex error", details: String(err?.message || err) });
  }
};
