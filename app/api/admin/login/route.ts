import { NextResponse } from "next/server";
import {
  createContentAdminSessionToken,
  getContentAdminSecret,
  isContentAdminConfigured,
  CONTENT_ADMIN_COOKIE_NAME,
  contentAdminSessionCookieOptions,
} from "@/lib/contentAdminAuth";

export async function POST(req: Request) {
  if (!isContentAdminConfigured()) {
    return NextResponse.json(
      { error: "Content admin is not configured. Set CONTENT_ADMIN_SECRET (min 8 characters) in your environment." },
      { status: 503 },
    );
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

  const token = createContentAdminSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Could not create session." }, { status: 500 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set(CONTENT_ADMIN_COOKIE_NAME, token, contentAdminSessionCookieOptions());
  return res;
}

export async function GET() {
  return NextResponse.json({
    configured: isContentAdminConfigured(),
  });
}
