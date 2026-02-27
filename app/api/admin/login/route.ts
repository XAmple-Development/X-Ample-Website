import { NextResponse } from "next/server";
import { getContentAdminSecret, isContentAdminConfigured, CONTENT_ADMIN_COOKIE_NAME } from "@/lib/contentAdminAuth";

export async function POST(req: Request) {
  if (!isContentAdminConfigured()) {
    return NextResponse.json({ error: "Admin not configured." }, { status: 503 });
  }
  const secret = getContentAdminSecret()!;

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }
  const password = typeof body.password === "string" ? body.password.trim() : "";
  if (password !== secret) {
    return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set(CONTENT_ADMIN_COOKIE_NAME, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}
