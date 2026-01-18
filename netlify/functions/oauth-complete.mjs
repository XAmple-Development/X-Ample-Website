import { createCompleteHandler } from "netlify-cms-oauth-provider-node";

/**
 * Completes the OAuth flow for Decap/Netlify CMS.
 * Returns HTML that postMessages the access token back to the CMS.
 */
export const handler = async (event) => {
  try {
    const complete = createCompleteHandler({}, { useEnv: true });
    const params = event.queryStringParameters ?? {};
    const html = await complete(params.code, params);
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
      body: html,
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: `OAuth complete error: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
};

