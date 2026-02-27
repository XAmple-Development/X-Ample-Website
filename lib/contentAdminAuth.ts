import { cookies } from "next/headers";

const COOKIE_NAME = "xa_content_admin";

export function getContentAdminSecret(): string | undefined {
  return process.env.CONTENT_ADMIN_SECRET;
}

export function isContentAdminConfigured(): boolean {
  const secret = getContentAdminSecret();
  return Boolean(secret && secret.length >= 8);
}

/**
 * Check if the request has a valid content-admin session (cookie matches secret).
 * Use in API route handlers: pass the request or the cookie value.
 */
export async function hasContentAdminAuth(request?: Request): Promise<boolean> {
  const secret = getContentAdminSecret();
  if (!secret) return false;

  let cookieValue: string | null = null;
  if (request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      cookieValue = authHeader.slice(7);
    } else {
      const cookieHeader = request.headers.get("cookie");
      const match = cookieHeader?.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
      cookieValue = match?.[1] ?? null;
    }
  } else {
    const store = await cookies();
    cookieValue = store.get(COOKIE_NAME)?.value ?? null;
  }

  if (!cookieValue) return false;
  return cookieValue === secret;
}

export { COOKIE_NAME as CONTENT_ADMIN_COOKIE_NAME };
