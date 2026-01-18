import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { promises as fs } from 'fs';
import path from 'path';

const COOKIE_NAME = 'admin-pass';

function authed() {
  const jar = cookies();
  const value = jar.get(COOKIE_NAME)?.value;
  const expected = process.env.ADMIN_PASSWORD || '';
  return expected && value === expected;
}

export async function GET(_, { params }) {
  if (!authed()) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  const { locale } = await params;
  const filePath = path.join(process.cwd(), 'messages', `${locale}.json`);
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({});
  }
}

export async function POST(req, { params }) {
  if (process.env.NEXT_PUBLIC_IS_DEMO === "true") return NextResponse.json({ error: 'Cannot make changes in demo mode' }, { status: 400 });

  if (!authed()) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  const isServerless = process.env.USING_SERVERLESS === 'true' || process.env.NEXT_RUNTIME === 'edge';
  if (isServerless) {
    return NextResponse.json(
      { error: 'This deployment cannot persist locale changes (serverless filesystem).' },
      { status: 400 }
    );
  }
  const { locale } = await params;
  const data = await req.json();
  const filePath = path.join(process.cwd(), 'messages', `${locale}.json`);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  return NextResponse.json({ ok: true });
}


