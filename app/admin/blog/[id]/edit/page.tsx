"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { BlogPostForm } from "../../BlogPostForm";

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  status: string;
  published_at: string | null;
  body_mdx: string;
};

export default function EditBlogPostPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/blog/${id}`)
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/admin/login";
          return null;
        }
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then(setPost)
      .catch(() => setError("Failed to load post."))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(data: Record<string, string | null>) {
    setSaving(true);
    setError("");
    const res = await fetch(`/api/admin/blog/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    setSaving(false);
    if (res.ok) {
      router.push("/admin/blog");
      router.refresh();
    } else {
      setError(json.error || "Failed to update post.");
    }
  }

  if (loading) return <p className="text-sm text-foreground/70">Loading…</p>;
  if (!post) return <p className="text-sm text-red-600">{error || "Not found."}</p>;

  const initial = {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? "",
    status: post.status,
    published_at: post.published_at ?? "",
    body_mdx: post.body_mdx ?? "",
  };

  return (
    <div>
      <Link href="/admin/blog" className="text-sm text-foreground/70 underline hover:text-foreground">
        ← Blog
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">Edit post</h1>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      <BlogPostForm initial={initial} onSubmit={handleSubmit} saving={saving} />
    </div>
  );
}
