import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { isAdminForSession } from "@/lib/admin";

const FALLBACK_CANONICAL = "https://x-ampledevelopment.co.uk";

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
  const { pathname, searchParams } = req.nextUrl;

  // If a user lands on a Netlify deploy-preview domain, force them onto the canonical domain.
  // Otherwise cookies like `xa_session` won't exist on the new host and it looks like a sign-out.
  const host = req.headers.get("host") ?? "";
  const canonical = canonicalOrigin();
  if (canonical && host.endsWith(".netlify.app")) {
    const next = new URL(req.nextUrl.toString());
    const canon = new URL(canonical);
    next.protocol = canon.protocol;
    next.host = canon.host;
    return NextResponse.redirect(next, 308);
  }

  // Allow auth callback without an existing session.
  // Use startsWith to handle trailing slashes.
  if (pathname.startsWith("/dashboard/auth")) return NextResponse.next();

  // Only gate dashboard pages + dashboard APIs. Everything else (marketing, store, docs, Tebex webhooks, cron) is public.
  const isDashboardPath = pathname.startsWith("/dashboard") || pathname.startsWith("/api/dashboard");
  if (!isDashboardPath) return NextResponse.next();

  const session = await getSessionFromRequest(req);
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/store";
    url.search = "";
    url.searchParams.set("error", "login_required");
    return NextResponse.redirect(url);
  }

  // Admin gating
  const isAdminPath = pathname.startsWith("/dashboard/admin") || pathname.startsWith("/api/dashboard/admin");
  if (isAdminPath && !(await isAdminForSession(session))) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    url.searchParams.set("error", "admin_required");
    return NextResponse.redirect(url);
  }

  // Keep existing query params; no changes needed.
  void searchParams;
  return NextResponse.next();
}

export const config = {
  // Apply to all routes so deploy-preview domains can't break auth/session.
  matcher: ["/:path*"],
};

