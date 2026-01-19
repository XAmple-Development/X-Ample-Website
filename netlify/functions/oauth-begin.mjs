/**
 * Starts the OAuth flow for Decap/Netlify CMS.
 *
 * Env vars used (set in Netlify UI):
 * - OAUTH_PROVIDER=github
 * - OAUTH_CLIENT_ID=...
 * - OAUTH_SCOPES=repo,user:email (adjust as needed)
 * - COMPLETE_URL=https://x-ampledevelopment.co.uk/.netlify/functions/oauth-complete
 */
export const handler = async (event) => {
  try {
    const clientId = process.env.OAUTH_CLIENT_ID;
    const completeUrl = process.env.COMPLETE_URL;
    const scopes = process.env.OAUTH_SCOPES || "repo,user:email";

    if (!clientId) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
        body: "OAuth begin error: missing env var OAUTH_CLIENT_ID",
      };
    }
    if (!completeUrl) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
        body: "OAuth begin error: missing env var COMPLETE_URL",
      };
    }

    const state = event.queryStringParameters?.state ?? "";
    const url = new URL("https://github.com/login/oauth/authorize");
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", completeUrl);
    url.searchParams.set("scope", scopes);
    if (state) url.searchParams.set("state", state);

    return {
      statusCode: 302,
      headers: {
        Location: url.toString(),
        "Cache-Control": "no-store",
      },
      body: "",
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: `OAuth begin error: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
};

