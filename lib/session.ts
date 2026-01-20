import "server-only";

import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";

export async function getSessionFromCookies() {
  const c = await cookies();
  const token = c.get("xa_session")?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

