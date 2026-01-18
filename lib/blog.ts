import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";

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

export async function listBlogPosts(): Promise<BlogPostMeta[]> {
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

export async function readBlogPostSource(slug: string) {
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

