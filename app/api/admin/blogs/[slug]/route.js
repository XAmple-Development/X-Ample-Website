import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSettings, setSettings } from '../../../../../utils/settingsServer';

const COOKIE_NAME = 'admin-pass';

function authed() {
  const jar = cookies();
  const value = jar.get(COOKIE_NAME)?.value;
  const expected = process.env.ADMIN_PASSWORD || '';
  return expected && value === expected;
}

export async function GET(_, { params }) {
  if (!authed()) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  const { slug } = await params;
  const settings = await getSettings();
  const posts = Array.isArray(settings.blog?.settings?.posts) ? settings.blog.settings.posts : [];
  const post = posts.find(p => p.slug === slug);
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(post);
}

export async function PUT(req, { params }) {
  if (!authed()) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  const { slug } = await params;
  const body = await req.json();
  const settings = await getSettings();
  const posts = Array.isArray(settings.blog?.settings?.posts) ? settings.blog.settings.posts : [];
  const idx = posts.findIndex(p => p.slug === slug);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const updated = { ...posts[idx], ...body };
  const next = { ...settings };
  next.blog.settings.posts = posts.slice(0, idx).concat(updated, posts.slice(idx + 1));
  await setSettings(next);
  return NextResponse.json({ ok: true, post: updated });
}

export async function DELETE(_, { params }) {
  if (!authed()) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  const { slug } = await params;
  const settings = await getSettings();
  const posts = Array.isArray(settings.blog?.settings?.posts) ? settings.blog.settings.posts : [];
  const nextPosts = posts.filter(p => p.slug !== slug);
  const next = { ...settings };
  next.blog.settings.posts = nextPosts;
  await setSettings(next);
  return NextResponse.json({ ok: true });
}


