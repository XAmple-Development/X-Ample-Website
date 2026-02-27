import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const FALLBACK_CANONICAL = "https://x-ampledevelopment.co.uk";
const ADMIN_COOKIE = "xa_content_admin";

function canonicalOrigin(): string | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || FALLBACK_CANONICAL;
  try {
    const u = new URL(raw);
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Content admin: protect /admin except /admin/login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !pathname.startsWith("/admin/login/")) {
    const secret = process.env.CONTENT_ADMIN_SECRET;
    if (secret && secret.length >= 8) {
      const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
      if (cookie !== secret) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
    }
  }

  // If a user lands on a Netlify deploy-preview domain, redirect to the canonical domain.
  const host = req.headers.get("host") ?? "";
  const canonical = canonicalOrigin();
  if (canonical && host.endsWith(".netlify.app")) {
    const next = new URL(req.nextUrl.toString());
    const canon = new URL(canonical);
    next.protocol = canon.protocol;
    next.host = canon.host;
    return NextResponse.redirect(next, 308);
  }
  return NextResponse.next();
}

export const config = {
  // Apply to all routes so deploy-preview domains can't break auth/session.
  matcher: ["/:path*"],
};

