import Link from "next/link";
import { listBlogPosts } from "@/lib/blog";

export const metadata = {
  title: "Blog",
};

export default async function BlogIndexPage() {
  const posts = await listBlogPosts();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
        <p className="text-foreground/75">
          Updates, releases, and behind-the-scenes notes from X-Ample.
        </p>
      </div>

      <div className="mt-8 grid gap-4">
        {posts.map((p) => (
          <Link
            key={p.slug}
            href={`/blog/${encodeURIComponent(p.slug)}`}
            className="block rounded-2xl border border-black/10 p-5 transition-colors hover:bg-black/[.03] dark:border-white/10 dark:hover:bg-white/[.06]"
          >
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold">{p.title}</p>
              <p className="text-sm text-foreground/70">
                {p.date} · {p.readingTimeText}
              </p>
              {p.excerpt ? (
                <p className="text-sm leading-6 text-foreground/75">
                  {p.excerpt}
                </p>
              ) : null}
            </div>
          </Link>
        ))}

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-black/10 p-5 text-sm text-foreground/75 dark:border-white/10">
            No posts yet.
          </div>
        ) : null}
      </div>
    </div>
  );
}

