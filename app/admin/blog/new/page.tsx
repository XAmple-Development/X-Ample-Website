"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BlogPostForm } from "../BlogPostForm";

export default function NewBlogPostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(data: Record<string, string | null>) {
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    setSaving(false);
    if (res.ok) {
      router.push("/admin/blog");
      router.refresh();
    } else {
      setError(json.error || "Failed to create post.");
    }
  }

  return (
    <div>
      <Link href="/admin/blog" className="text-sm text-foreground/70 underline hover:text-foreground">
        ← Blog
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">New post</h1>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      <BlogPostForm onSubmit={handleSubmit} saving={saving} />
    </div>
  );
}
