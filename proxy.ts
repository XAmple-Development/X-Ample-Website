import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifyContentAdminSessionToken } from "@/lib/contentAdminAuth";

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

/** Next.js app routes for Supabase-backed content admin (password login). */
function isContentAdminAppRoute(pathname: string): boolean {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/vacancies") ||
    pathname.startsWith("/admin/portfolio") ||
    pathname.startsWith("/admin/team") ||
    pathname.startsWith("/admin/newsletter") ||
    pathname.startsWith("/admin/waitlist")
  );
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Content admin: protect app routes only — not Decap CMS at /cms
  if (
    isContentAdminAppRoute(pathname) &&
    pathname !== "/admin/login" &&
    !pathname.startsWith("/admin/login/")
  ) {
    const secret = process.env.CONTENT_ADMIN_SECRET;
    if (secret && secret.length >= 8) {
      const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
      if (!verifyContentAdminSessionToken(cookie)) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
    }
  }

  // Redirect Netlify deploy-preview domains to canonical production URL.
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
  matcher: ["/:path*"],
};
