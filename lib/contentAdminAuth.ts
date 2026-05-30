import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "xa_content_admin";
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7;

export function getContentAdminSecret(): string | undefined {
  return process.env.CONTENT_ADMIN_SECRET;
}

export function isContentAdminConfigured(): boolean {
  const secret = getContentAdminSecret();
  return Boolean(secret && secret.length >= 8);
}

function signSessionPayload(expMs: number, secret: string): string {
  return createHmac("sha256", secret).update(String(expMs)).digest("hex");
}

/** Create a signed session token (stored in the HttpOnly cookie). */
export function createContentAdminSessionToken(): string | null {
  const secret = getContentAdminSecret();
  if (!secret) return null;
  const expMs = Date.now() + SESSION_MAX_AGE_SEC * 1000;
  const sig = signSessionPayload(expMs, secret);
  return `${expMs}.${sig}`;
}

export function verifyContentAdminSessionToken(token: string | null | undefined): boolean {
  if (!token) return false;
  const secret = getContentAdminSecret();
  if (!secret) return false;

  const [expRaw, sig] = token.split(".");
  if (!expRaw || !sig) return false;

  const expMs = Number(expRaw);
  if (!Number.isFinite(expMs) || expMs <= Date.now()) return false;

  const expected = signSessionPayload(expMs, secret);
  try {
    const a = Buffer.from(sig, "utf8");
    const b = Buffer.from(expected, "utf8");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function contentAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  };
}

/**
 * Check if the request has a valid content-admin session.
 */
export async function hasContentAdminAuth(request?: Request): Promise<boolean> {
  if (!isContentAdminConfigured()) return false;

  let cookieValue: string | null = null;
  if (request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      cookieValue = authHeader.slice(7);
    } else {
      const cookieHeader = request.headers.get("cookie");
      const match = cookieHeader?.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
      cookieValue = match?.[1] ? decodeURIComponent(match[1]) : null;
    }
  } else {
    const store = await cookies();
    cookieValue = store.get(COOKIE_NAME)?.value ?? null;
  }

  return verifyContentAdminSessionToken(cookieValue);
}

export { COOKIE_NAME as CONTENT_ADMIN_COOKIE_NAME, SESSION_MAX_AGE_SEC };
