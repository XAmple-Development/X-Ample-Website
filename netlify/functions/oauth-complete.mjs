/**
 * Completes the OAuth flow for Decap/Netlify CMS.
 *
 * This is a minimal GitHub OAuth handler that returns an HTML page which
 * communicates back to the Decap CMS popup opener via postMessage using the
 * standard Netlify/Decap message format:
 *   authorization:github:success:{"token":"...","provider":"github"}
 */
export const handler = async (event) => {
  try {
    const params = event.queryStringParameters ?? {};
    const code = params.code;

    const originList = process.env.ORIGIN;
    const adminPanelUrl = process.env.ADMIN_PANEL_URL || "/admin";

    if (!originList) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
        body: "OAuth complete error: missing env var ORIGIN",
      };
    }

    if (!code) {
      return htmlResponse(
        renderCompleteHtml({
          oauthProvider: "github",
          originPattern: originListToPattern(originList),
          adminPanelUrl,
          message: "error",
          content:
            "Invalid code received from GitHub or code could not be received.",
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
      return {
        statusCode: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
        body: "OAuth complete error: missing OAUTH_CLIENT_ID/OAUTH_CLIENT_SECRET/COMPLETE_URL",
      };
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
        originPattern: originListToPattern(originList),
        adminPanelUrl,
        message: "success",
        content,
        display: "Logging you in via GitHub...",
        displayClasses: "",
      }),
    );
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: `OAuth complete error: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
};

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
    const msg =
      json && typeof json === "object"
        ? JSON.stringify(json)
        : `HTTP ${res.status}`;
    throw new Error(`GitHub token exchange failed: ${msg}`);
  }
  return json.access_token;
}

function originListToPattern(originList) {
  // Accept comma-separated list; allow either full origin or bare domain.
  const origins = originList
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .flatMap((o) => expandOrigin(o));

  const escaped = origins.map((o) =>
    o
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\//g, "\\/"),
  );
  return `/^(${escaped.join("|")})$/i`;
}

function expandOrigin(origin) {
  // If protocol provided, keep as-is. Otherwise allow http/https with optional default ports.
  if (/^https?:\/\//i.test(origin)) {
    return [origin];
  }
  const host = origin.replace(/\/+$/g, "");
  return [
    `https://${host}`,
    `http://${host}`,
    `https://${host}:443`,
    `http://${host}:80`,
  ];
}

function renderCompleteHtml({
  oauthProvider,
  originPattern,
  adminPanelUrl,
  message,
  content,
  display,
  displayClasses,
}) {
  const adminLink =
    adminPanelUrl && adminPanelUrl !== "#"
      ? `<a href="${escapeHtml(
          adminPanelUrl,
        )}" target="_blank" class="close-link">the admin panel</a>`
      : "the admin panel";

  // content: for success should be a JSON string like {"token":"...","provider":"github"}
  const contentJs =
    message === "success"
      ? content
      : JSON.stringify(String(content || "An error occurred."));

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Logging you in via GitHub...</title>
  <meta name="description" content="Logging you in via GitHub...">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { text-align: center; font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; padding: 24px; }
    .error { color: #ff6a6a; }
    a { color: inherit; }
  </style>
</head>
<body>
  <p class="display${displayClasses ? " " + displayClasses : ""}">${escapeHtml(
    display || "",
  )}</p>
  <p class="error origin-error" hidden>
    Couldn't verify you came from an authorized website. To protect your account, you'll need to return to
    ${adminLink} and try to log in again.
  </p>
  <script>
    (function() {
      window.log = function log() {
        if (console && console.log) console.log.apply(console, Array.prototype.slice.call(arguments));
      };
    })();
  </script>
  <script>
    (function() {
      if (window.opener) {
        function receiveMessage(e) {
          log('Receiving message:', e);
          var origin = e.origin === 'null' ? false : e.origin;
          if (!origin || !origin.match(${originPattern})) {
            log('Invalid origin: %s', e.origin);
            var display = document.getElementsByClassName('display');
            if (display && display.length) display[0].hidden = true;
            var originError = document.getElementsByClassName('origin-error');
            if (originError && originError.length) originError[0].hidden = false;
            return;
          }
          window.removeEventListener('message', receiveMessage, false);
          var msg = 'authorization:${oauthProvider}:${message}:' + ${contentJs};
          log('Sending message:', msg);
          window.opener.postMessage(msg, origin);
        }
        window.addEventListener('message', receiveMessage, false);
        var handshakeMessage = 'authorizing:${oauthProvider}';
        log('Sending message:', handshakeMessage);
        window.opener.postMessage(handshakeMessage, '*');
      } else {
        log('No opener. Not doing anything.');
      }
    })();
  </script>
  <script>
    (function () {
      var closeLinks = document.getElementsByClassName('close-link');
      for (var i = 0, n = closeLinks.length || 0; i < n; i++) {
        closeLinks[i].addEventListener('click', function (event) {
          if (event.target && event.target.href === '#') event.preventDefault();
          window.close();
        }, false);
      }
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

