import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSessionFromRequest, isAdminForCustomerId } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // Allow auth callback without an existing session.
  if (pathname === "/dashboard/auth") return NextResponse.next();

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
  if (isAdminPath && !isAdminForCustomerId(session.tebexCustomerId)) {
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
  matcher: ["/dashboard/:path*", "/api/dashboard/:path*"],
};

