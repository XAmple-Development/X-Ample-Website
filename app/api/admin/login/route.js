import { NextResponse } from 'next/server';

const COOKIE_NAME = 'admin-pass';

export async function POST(req) {
  const { password } = await req.json();
  const expected = process.env.ADMIN_PASSWORD || '';
  if (!expected || password !== expected) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, password, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 8
  });
  return res;
}


