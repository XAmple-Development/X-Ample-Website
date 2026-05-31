import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { supabaseAdmin } from "@/lib/supabase";

export type BlogPostMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  readingTimeText: string;
};

export function blogDir() {
  return path.join(process.cwd(), "content", "blog");
}

function isPostFile(name: string) {
  return name.endsWith(".mdx") || name.endsWith(".md");
}

function formatPostDate(isoOrDate: string | null | undefined): string {
  if (!isoOrDate) return "";
  const d = new Date(isoOrDate);
  if (!Number.isFinite(d.getTime())) return String(isoOrDate).slice(0, 10);
  return d.toISOString().slice(0, 10);
}

async function listBlogPostsFromFiles(): Promise<BlogPostMeta[]> {
  const dir = blogDir();
  const names = await readdir(dir).catch(() => []);

  const posts = await Promise.all(
    names.filter(isPostFile).map(async (name) => {
      const slug = name.replace(/\.(mdx|md)$/i, "");
      const fullPath = path.join(dir, name);
      const raw = await readFile(fullPath, "utf8");
      const parsed = matter(raw);

      const title = String(parsed.data?.title ?? slug);
      const date = String(parsed.data?.date ?? "");
      const excerpt =
        typeof parsed.data?.excerpt === "string" ? parsed.data.excerpt : undefined;
      const rt = readingTime(parsed.content);

      return {
        slug,
        title,
        date,
        excerpt,
        readingTimeText: rt.text,
      } satisfies BlogPostMeta;
    }),
  );

  return posts
    .filter((p) => p.date)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

async function listBlogPostsFromSupabase(): Promise<BlogPostMeta[] | null> {
  try {
    const sb = supabaseAdmin();
    const ts = new Date().toISOString();
    const { data, error } = await sb
      .from("blog_posts")
      .select("slug, title, excerpt, published_at, body_mdx")
      .eq("status", "published")
      .not("published_at", "is", null)
      .lte("published_at", ts)
      .order("published_at", { ascending: false })
      .limit(200);

    if (error) throw error;

    return (data ?? []).map((row) => {
      const rt = readingTime(row.body_mdx ?? "");
      return {
        slug: row.slug,
        title: row.title,
        date: formatPostDate(row.published_at),
        excerpt: row.excerpt ?? undefined,
        readingTimeText: rt.text,
      };
    });
  } catch {
    return null;
  }
}

export async function listBlogPosts(): Promise<BlogPostMeta[]> {
  const fromDb = await listBlogPostsFromSupabase();
  const fromFiles = await listBlogPostsFromFiles();

  if (fromDb === null) return fromFiles;

  const dbSlugs = new Set(fromDb.map((p) => p.slug));
  const merged = [...fromDb, ...fromFiles.filter((p) => !dbSlugs.has(p.slug))];

  return merged.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

async function readBlogPostFromSupabase(slug: string) {
  try {
    const sb = supabaseAdmin();
    const ts = new Date().toISOString();
    const { data } = await sb
      .from("blog_posts")
      .select("title, excerpt, published_at, body_mdx")
      .eq("slug", slug)
      .eq("status", "published")
      .not("published_at", "is", null)
      .lte("published_at", ts)
      .maybeSingle();

    if (!data) return null;

    return {
      frontmatter: {
        title: data.title,
        date: formatPostDate(data.published_at),
        excerpt: data.excerpt ?? undefined,
      },
      content: data.body_mdx ?? "",
    };
  } catch {
    return null;
  }
}

async function readBlogPostFromFiles(slug: string) {
  const dir = blogDir();
  const mdxPath = path.join(dir, `${slug}.mdx`);
  const mdPath = path.join(dir, `${slug}.md`);

  const raw =
    (await readFile(mdxPath, "utf8").catch(() => null)) ??
    (await readFile(mdPath, "utf8").catch(() => null));

  if (!raw) return null;
  const parsed = matter(raw);
  return {
    frontmatter: parsed.data as Record<string, unknown>,
    content: parsed.content,
  };
}

export async function readBlogPostSource(slug: string) {
  const fromDb = await readBlogPostFromSupabase(slug);
  if (fromDb) return fromDb;
  return readBlogPostFromFiles(slug);
}
