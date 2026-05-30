/**
 * Completes the OAuth flow for Decap CMS.
 *
 * Handshake (both directions):
 * 1. This popup posts "authorizing:github" to the CMS window
 * 2. Decap replies (often with "authorizing:github" again)
 * 3. This popup posts authorization:github:success:{token JSON}
 *
 * See: https://decapcms.org/docs/backends-overview/
 */

export const handler = async (event) => {
  try {
    const params = event.queryStringParameters ?? {};
    const code = params.code;

    const originList = process.env.ORIGIN;
    const adminPanelUrl = process.env.ADMIN_PANEL_URL || "/cms";

    if (!originList) {
      return plainError("OAuth complete error: missing env var ORIGIN");
    }

    const allowedOrigins = expandOrigins(originList);

    if (!code) {
      return htmlResponse(
        renderCompleteHtml({
          oauthProvider: "github",
          allowedOrigins,
          adminPanelUrl,
          message: "error",
          content: "Invalid code received from GitHub or code could not be received.",
          display:
            "An error occurred. Please close this page and try again. Invalid code received from GitHub.",
          displayClasses: "error",
        }),
      );
    }

    const clientId = process.env.OAUTH_CLIENT_ID;
    const clientSecret = process.env.OAUTH_CLIENT_SECRET;
    const completeUrl = process.env.COMPLETE_URL;

    if (!clientId || !clientSecret || !completeUrl) {
      return plainError(
        "OAuth complete error: missing OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, or COMPLETE_URL",
      );
    }

    const token = await exchangeGitHubCodeForToken({
      clientId,
      clientSecret,
      code,
      redirectUri: completeUrl,
    });

    const content = JSON.stringify({ token, provider: "github" });

    return htmlResponse(
      renderCompleteHtml({
        oauthProvider: "github",
        allowedOrigins,
        adminPanelUrl,
        message: "success",
        content,
        display: "Logging you in via GitHub…",
        displayClasses: "",
      }),
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return htmlResponse(
      renderCompleteHtml({
        oauthProvider: "github",
        allowedOrigins: expandOrigins(process.env.ORIGIN || "x-ampledevelopment.co.uk"),
        adminPanelUrl: process.env.ADMIN_PANEL_URL || "/cms",
        message: "error",
        content: msg,
        display: `Login failed: ${msg}`,
        displayClasses: "error",
      }),
    );
  }
};

function plainError(body) {
  return {
    statusCode: 500,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
    body,
  };
}

function htmlResponse(body) {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
    body,
  };
}

async function exchangeGitHubCodeForToken({
  clientId,
  clientSecret,
  code,
  redirectUri,
}) {
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "x-ampledevelopment-cms-oauth",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok || !json || !json.access_token) {
    const detail =
      json && typeof json === "object"
        ? JSON.stringify(json)
        : `HTTP ${res.status}`;
    throw new Error(`GitHub token exchange failed: ${detail}`);
  }
  return json.access_token;
}

function expandOrigins(originList) {
  const out = new Set();
  for (const raw of originList.split(",")) {
    const item = raw.trim();
    if (!item) continue;
    if (/^https?:\/\//i.test(item)) {
      out.add(item.replace(/\/+$/, ""));
      continue;
    }
    const host = item.replace(/\/+$/, "");
    out.add(`https://${host}`);
    out.add(`http://${host}`);
    out.add(`https://www.${host}`);
    out.add(`http://www.${host}`);
  }
  return [...out];
}

function renderCompleteHtml({
  oauthProvider,
  allowedOrigins,
  adminPanelUrl,
  message,
  content,
  display,
  displayClasses,
}) {
  const adminLink =
    adminPanelUrl && adminPanelUrl !== "#"
      ? `<a href="${escapeHtml(adminPanelUrl)}" class="close-link">the CMS</a>`
      : "the CMS";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Logging you in via GitHub…</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { text-align: center; font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; padding: 24px; max-width: 32rem; margin: 2rem auto; line-height: 1.5; }
    .error { color: #ff6a6a; }
    .hint { color: #888; font-size: 0.875rem; margin-top: 1rem; }
    a { color: inherit; }
  </style>
</head>
<body>
  <p class="display${displayClasses ? " " + displayClasses : ""}">${escapeHtml(display || "")}</p>
  <p class="hint" id="hint" hidden>If this page does not close automatically, return to ${adminLink} and refresh.</p>
  <script>
    (function() {
      var oauthProvider = ${JSON.stringify(oauthProvider)};
      var status = ${JSON.stringify(message)};
      var content = ${JSON.stringify(content)};
      var allowedOrigins = ${JSON.stringify(allowedOrigins)};
      var sent = false;

      function isAllowedOrigin(origin) {
        if (!origin || origin === "null") return false;
        var o = origin.replace(/\\/$/, "");
        return allowedOrigins.some(function(allowed) {
          return allowed.toLowerCase() === o.toLowerCase();
        });
      }

      function buildMessage() {
        return "authorization:" + oauthProvider + ":" + status + ":" + content;
      }

      function deliverToken(targetOrigin) {
        if (sent || !window.opener) return;
        sent = true;
        var msg = buildMessage();
        try {
          window.opener.postMessage(msg, targetOrigin || "*");
        } catch (err) {
          console.error("postMessage failed", err);
        }
        setTimeout(function() {
          try { window.close(); } catch (e) {}
        }, 300);
      }

      if (!window.opener) {
        var el = document.querySelector(".display");
        if (el) {
          el.textContent = "Could not connect to the CMS window. Close this tab, open /cms, and try logging in again.";
          el.className = "display error";
        }
        return;
      }

      function onMessage(e) {
        if (!isAllowedOrigin(e.origin)) return;
        // Decap / Sveltia: parent echoes "authorizing:github" — or any allowed message completes the handshake
        deliverToken(e.origin);
      }

      window.addEventListener("message", onMessage, false);

      // Decap protocol: notify parent we are ready
      try {
        window.opener.postMessage("authorizing:" + oauthProvider, "*");
      } catch (err) {
        console.error("handshake postMessage failed", err);
      }

      // Fallback: parent may not reply (popup opener chain broken, or timing)
      setTimeout(function() {
        if (!sent) {
          var hint = document.getElementById("hint");
          if (hint) hint.hidden = false;
          allowedOrigins.forEach(function(o) { deliverToken(o); });
          deliverToken("*");
        }
      }, 1200);
    })();
  </script>
</body>
</html>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
