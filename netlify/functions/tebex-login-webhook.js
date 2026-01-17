const { createClient } = require("@supabase/supabase-js");

const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const getSupabaseClient = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
};

const resolveSessionToken = (payload) => {
  return (
    payload?.session_token ||
    payload?.sessionToken ||
    payload?.reference ||
    payload?.meta?.reference ||
    payload?.meta?.session_token ||
    payload?.metadata?.reference ||
    payload?.metadata?.session_token ||
    payload?.custom?.reference ||
    payload?.custom?.session_token ||
    null
  );
};

const resolveUsernameId = (payload) => {
  return (
    payload?.username_id ||
    payload?.usernameId ||
    payload?.data?.username_id ||
    payload?.data?.usernameId ||
    null
  );
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return json(500, { error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" });
  }

  let payload;
  try {
    payload = event.body ? JSON.parse(event.body) : {};
  } catch {
    return json(400, { error: "Invalid JSON body" });
  }

  const sessionToken = resolveSessionToken(payload);
  const usernameId = resolveUsernameId(payload);

  if (!sessionToken || !usernameId) {
    return json(400, { error: "Missing sessionToken or usernameId in webhook payload" });
  }

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  const { error } = await supabase.from("tebex_login_sessions").upsert(
    [
      {
        session_token: String(sessionToken),
        username_id: String(usernameId),
        expires_at: expiresAt,
        raw_payload: payload,
      },
    ],
    { onConflict: "session_token" }
  );

  if (error) {
    return json(500, { error: "Failed to store login session", details: error.message });
  }

  return json(200, { ok: true });
};
