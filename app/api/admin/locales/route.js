import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { promises as fs } from 'fs';
import path from 'path';
import { getSettings } from '../../../../utils/settingsServer';

const COOKIE_NAME = 'admin-pass';

function authed() {
  const jar = cookies();
  const value = jar.get(COOKIE_NAME)?.value;
  const expected = process.env.ADMIN_PASSWORD || '';
  return expected && value === expected;
}

export async function GET() {
  if (!authed()) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  const settings = await getSettings();
  const fromSettings = (settings?.translation?.settings?.languages || []).map(l => l.key);
  const dir = path.join(process.cwd(), 'messages');
  let fromFiles = [];
  try {
    const files = await fs.readdir(dir);
    fromFiles = files.filter(f => f.endsWith('.json')).map(f => f.replace(/\.json$/, ''));
  } catch {}
  const locales = Array.from(new Set([...(fromSettings || []), ...(fromFiles || [])]));
  return NextResponse.json({ locales });
}


