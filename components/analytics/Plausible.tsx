import Script from "next/script";

function deriveDomain(): string | null {
  const explicit = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (explicit && explicit.trim()) return explicit.trim();

  // Fallback to canonical site URL if domain env isn't set.
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://x-ampledevelopment.co.uk";

  try {
    const u = new URL(raw);
    // If someone accidentally points SITE_URL at a Netlify preview, don't use that.
    if (u.host.endsWith(".netlify.app")) return "x-ampledevelopment.co.uk";
    return u.host;
  } catch {
    return null;
  }
}

export function Plausible() {
  // Only run in production builds (prevents local/dev noise + avoids verification confusion).
  if (process.env.NODE_ENV !== "production") return null;

  const domain = deriveDomain();
  if (!domain) return null;

  return (
    <Script
      defer
      data-domain={domain}
      src="https://plausible.io/js/script.js"
    />
  );
}

