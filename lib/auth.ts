import "server-only";

import { SignJWT, jwtVerify } from "jose";
import type { NextRequest } from "next/server";

export const SESSION_COOKIE_NAME = "xa_session";

export type SessionClaims = {
  /** Supabase user UUID */
  userId: string;
  /** Stable external id used for admin allowlist checks */
  tebexCustomerId: string;
  username?: string | null;
  email?: string | null;
};

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function sessionKey() {
  // Accept either a long random string or a base64-ish secret; we just use bytes.
  return new TextEncoder().encode(mustEnv("SESSION_SECRET"));
}

export async function signSession(claims: SessionClaims) {
  return await new SignJWT({
    userId: claims.userId,
    tebexCustomerId: claims.tebexCustomerId,
    username: claims.username ?? null,
    email: claims.email ?? null,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(sessionKey());
}

export async function verifySessionToken(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, sessionKey(), { algorithms: ["HS256"] });
    const userId = typeof payload.userId === "string" ? payload.userId : null;
    const tebexCustomerId = typeof payload.tebexCustomerId === "string" ? payload.tebexCustomerId : null;
    if (!userId || !tebexCustomerId) return null;

    return {
      userId,
      tebexCustomerId,
      username: typeof payload.username === "string" ? payload.username : null,
      email: typeof payload.email === "string" ? payload.email : null,
    };
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(req: NextRequest): Promise<SessionClaims | null> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

export function isAdminForCustomerId(tebexCustomerId: string): boolean {
  const raw = (process.env.ADMIN_ALLOWLIST ?? "").trim();
  if (!raw) return false;
  const set = new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
  return set.has(tebexCustomerId);
}

