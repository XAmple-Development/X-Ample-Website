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

function slugify(str = '') {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function POST(req) {

  if (process.env.NEXT_PUBLIC_IS_DEMO === "true") return NextResponse.json({ error: 'Cannot make changes in demo mode' }, { status: 400 });

  if (!authed()) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  const body = await req.json();
  const settings = await getSettings();
  const posts = Array.isArray(settings.blog?.settings?.posts) ? settings.blog.settings.posts : [];

  const title = body.title || 'Untitled';
  const slug = body.slug ? slugify(body.slug) : slugify(title);
  const exists = posts.some(p => p.slug === slug);
  if (exists) return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });

  const now = new Date().toISOString();
  const post = {
    id: body.id || slug,
    title,
    slug,
    excerpt: body.excerpt || '',
    feature_image: body.feature_image || '',
    published_at: body.published_at || now,
    html: body.html || ''
  };

  const next = { ...settings };
  next.blog = next.blog || { description: 'Blog system configuration', settings: {} };
  next.blog.settings = next.blog.settings || {};
  next.blog.settings.posts = posts.concat(post);
  await setSettings(next);
  return NextResponse.json({ ok: true, post });
}


