import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSettings, setSettings } from '../../../../utils/settingsServer';

const COOKIE_NAME = 'admin-pass';

function authed() {
  const jar = cookies();
  const value = jar.get(COOKIE_NAME)?.value;
  const expected = process.env.ADMIN_PASSWORD || '';
  return expected && value === expected;
}

export async function GET() {
  if (!authed()) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  const data = await getSettings();
  return NextResponse.json(data);
}

export async function POST(req) {
  if (process.env.NEXT_PUBLIC_IS_DEMO === "true") return NextResponse.json({ error: 'Cannot make changes in demo mode' }, { status: 400 });
  
  if (!authed()) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  const incoming = await req.json();
  const saved = await setSettings(incoming);
  return NextResponse.json({ ok: true, settings: saved });
}


