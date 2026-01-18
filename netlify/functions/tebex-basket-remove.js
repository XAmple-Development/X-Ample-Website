const DEFAULT_TEBEX_BASE = "https://headless.tebex.io/api";

const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const getAuthHeader = () => {
  const projectId = process.env.TEBEX_PROJECT_ID;
  const privateKey = process.env.TEBEX_PRIVATE_KEY;
  const token = Buffer.from(`${projectId}:${privateKey}`).toString("base64");
  return `Basic ${token}`;
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  const accountToken = process.env.TEBEX_ACCOUNT_TOKEN;
  const authHeader = getAuthHeader();
  const tebexBase = DEFAULT_TEBEX_BASE;

  const { ident, packageId } = JSON.parse(event.body || "{}");

  if (!ident || !packageId)
    return json(400, { error: "Missing ident or packageId" });

  try {
    const res = await fetch(
      `${tebexBase}/baskets/${ident}/packages/${packageId}`,
      {
        method: "DELETE",
        headers: { Authorization: authHeader },
      }
    );

    if (!res.ok) {
      return json(res.status, { error: "Failed to remove item", details: await res.text() });
    }

    return json(200, { success: true });
  } catch (err) {
    return json(500, { error: "Unexpected error", details: String(err) });
  }
};
