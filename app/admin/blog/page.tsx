"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type BlogPostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  status: string;
  published_at: string | null;
  updated_at: string;
};

export default function AdminBlogPage() {
  const [list, setList] = useState<BlogPostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/blog")
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/admin/login";
          return [];
        }
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then(setList)
      .catch(() => setError("Failed to load blog posts."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-foreground/70">Loading…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Blog</h1>
        <Link
          href="/admin/blog/new"
          className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          New post
        </Link>
      </div>
      <p className="mt-2 text-sm text-foreground/70">
        Posts publish to the site when status is &quot;published&quot; and a publish date is set.
        No GitHub commit required.
      </p>
      <div className="mt-6 space-y-2">
        {list.length === 0 ? (
          <p className="rounded-2xl border border-black/10 p-5 text-sm text-foreground/70 dark:border-white/10">
            No posts yet. Create one to get started.
          </p>
        ) : (
          list.map((post) => (
            <div
              key={post.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/10 p-4 dark:border-white/10"
            >
              <div>
                <span className="font-medium">{post.title}</span>
                <span className="ml-2 rounded-full border px-2 py-0.5 text-xs opacity-80">
                  {post.status}
                </span>
                {post.slug ? (
                  <span className="ml-2 text-xs text-foreground/60">/blog/{post.slug}</span>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                {post.status === "published" && post.slug ? (
                  <a
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-foreground/70 underline hover:text-foreground"
                  >
                    View
                  </a>
                ) : null}
                <Link
                  href={`/admin/blog/${post.id}/edit`}
                  className="rounded-lg border px-3 py-2 text-sm hover:bg-black/5"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
