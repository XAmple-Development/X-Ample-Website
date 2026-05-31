"use client";

import { useState } from "react";

type Props = {
  initial?: Record<string, string>;
  onSubmit: (data: Record<string, string | null>) => Promise<void>;
  saving: boolean;
};

const defaultInitial: Record<string, string> = {
  title: "",
  slug: "",
  excerpt: "",
  status: "draft",
  published_at: "",
  body_mdx: "",
};

export function BlogPostForm({ initial = defaultInitial, onSubmit, saving }: Props) {
  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [excerpt, setExcerpt] = useState(initial.excerpt);
  const [status, setStatus] = useState(initial.status || "draft");
  const [published_at, setPublishedAt] = useState(initial.published_at);
  const [body_mdx, setBodyMdx] = useState(initial.body_mdx);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      title: title.trim() || null,
      slug: slug.trim() || null,
      excerpt: excerpt.trim() || null,
      status,
      published_at: published_at.trim() || null,
      body_mdx: body_mdx.trim() || null,
    });
  }

  const inputClass =
    "h-11 w-full rounded-xl border border-black/15 bg-background px-3 text-sm outline-none ring-0 focus:border-black/40 dark:border-white/15 dark:focus:border-white/35";
  const textareaClass =
    "w-full min-h-[200px] rounded-xl border border-black/15 bg-background px-3 py-2 text-sm outline-none ring-0 focus:border-black/40 dark:border-white/15 dark:focus:border-white/35 font-mono";

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <Field label="Title" required>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={inputClass}
        />
      </Field>
      <Field label="Slug (URL path)">
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="e.g. studio-update-may-2026"
          className={inputClass}
        />
      </Field>
      <Field label="Excerpt">
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          className={textareaClass.replace("font-mono", "")}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Status">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={inputClass}
          >
            <option value="draft">Draft (hidden)</option>
            <option value="published">Published</option>
          </select>
        </Field>
        <Field label="Published at">
          <input
            type="datetime-local"
            value={published_at ? published_at.slice(0, 16) : ""}
            onChange={(e) =>
              setPublishedAt(e.target.value ? new Date(e.target.value).toISOString() : "")
            }
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="Body (MDX / Markdown)">
        <textarea
          value={body_mdx}
          onChange={(e) => setBodyMdx(e.target.value)}
          rows={16}
          className={textareaClass}
        />
      </Field>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-foreground px-6 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">
        {label}
        {required ? " *" : ""}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
