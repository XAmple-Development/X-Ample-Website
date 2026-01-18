import { createBeginHandler } from "netlify-cms-oauth-provider-node";

/**
 * Starts the OAuth flow for Decap/Netlify CMS.
 *
 * Env vars used (set in Netlify UI):
 * - OAUTH_PROVIDER=github
 * - OAUTH_CLIENT_ID=...
 * - OAUTH_CLIENT_SECRET=...
 * - OAUTH_SCOPES=repo,user:email (adjust as needed)
 * - COMPLETE_URL=https://x-ampledevelopment.co.uk/.netlify/functions/oauth-complete
 * - ORIGIN=x-ampledevelopment.co.uk
 */
export const handler = async (event) => {
  try {
    const begin = createBeginHandler({}, { useEnv: true });
    const state = event.queryStringParameters?.state;
    const url = await begin(state);
    return {
      statusCode: 302,
      headers: {
        Location: url,
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

