import Link from "next/link";
import { listBlogPosts } from "@/lib/blog";
import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";

const blogDescription =
  "Updates, releases, and behind-the-scenes notes from X-Ample Development. Discord bots, web development, and studio news.";

export const metadata: Metadata = {
  title: "Blog",
  description: blogDescription,
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog · X-Ample Development",
    description: blogDescription,
    type: "website",
    url: "/blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog · X-Ample Development",
    description: blogDescription,
  },
};

export default async function BlogIndexPage() {
  const posts = await listBlogPosts();

  return (
    <div className="space-y-10">
      <PageHeader
        kicker="Blog"
        title="Studio notes"
        description="Updates, releases, and behind-the-scenes notes from X-Ample."
      />

      <div className="mx-auto max-w-3xl grid gap-4">
        {posts.map((p) => (
          <Link
            key={p.slug}
            href={`/blog/${encodeURIComponent(p.slug)}`}
            className="block rounded-2xl border border-border bg-surface p-5 transition-all hover:border-accent/30 hover:bg-accent-muted"
          >
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold">{p.title}</p>
              <p className="text-sm text-muted">
                {p.date} · {p.readingTimeText}
              </p>
              {p.excerpt ? (
                <p className="text-sm leading-6 text-muted">{p.excerpt}</p>
              ) : null}
            </div>
          </Link>
        ))}

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-5 text-sm text-muted">
            No posts yet.
          </div>
        ) : null}
      </div>
    </div>
  );
}
