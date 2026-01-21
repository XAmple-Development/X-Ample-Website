import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export type PackageDocMeta = {
  /** Tebex package id as string */
  id: string;
  title?: string;
  summary?: string;
  updated?: string;
};

export function packageDocsDir() {
  return path.join(process.cwd(), "content", "docs", "packages");
}

function isDocFile(name: string) {
  return name.endsWith(".mdx") || name.endsWith(".md");
}

function normalizeIdFromFilename(name: string) {
  return name.replace(/\.(mdx|md)$/i, "").trim();
}

export async function listPackageDocMetas(): Promise<PackageDocMeta[]> {
  const dir = packageDocsDir();
  const names = await readdir(dir).catch(() => []);

  const metas = await Promise.all(
    names.filter(isDocFile).map(async (name) => {
      const id = normalizeIdFromFilename(name);
      const fullPath = path.join(dir, name);
      const raw = await readFile(fullPath, "utf8").catch(() => "");
      if (!raw) return { id } satisfies PackageDocMeta;

      const parsed = matter(raw);
      const data = (parsed.data ?? {}) as any;

      const title = typeof data.title === "string" ? data.title : undefined;
      const summary = typeof data.summary === "string" ? data.summary : undefined;
      const updated = typeof data.updated === "string" ? data.updated : undefined;

      return { id, title, summary, updated } satisfies PackageDocMeta;
    }),
  );

  return metas.filter((m) => m.id);
}

export async function readPackageDocSource(id: string) {
  const dir = packageDocsDir();
  const safe = String(id).trim();
  if (!safe) return null;

  const mdxPath = path.join(dir, `${safe}.mdx`);
  const mdPath = path.join(dir, `${safe}.md`);

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

