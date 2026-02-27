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
  location: "",
  type: "",
  salary: "",
  status: "draft",
  published_at: "",
  body_mdx: "",
  apply_url: "",
  apply_email: "",
};

export function VacancyForm({ initial = defaultInitial, onSubmit, saving }: Props) {
  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [location, setLocation] = useState(initial.location);
  const [type, setType] = useState(initial.type);
  const [salary, setSalary] = useState(initial.salary);
  const [status, setStatus] = useState(initial.status || "draft");
  const [published_at, setPublishedAt] = useState(initial.published_at);
  const [body_mdx, setBodyMdx] = useState(initial.body_mdx);
  const [apply_url, setApplyUrl] = useState(initial.apply_url);
  const [apply_email, setApplyEmail] = useState(initial.apply_email);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      title: title.trim() || null,
      slug: slug.trim() || null,
      location: location.trim() || null,
      type: type.trim() || null,
      salary: salary.trim() || null,
      status,
      published_at: published_at.trim() || null,
      body_mdx: body_mdx.trim() || null,
      apply_url: apply_url.trim() || null,
      apply_email: apply_email.trim() || null,
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
          placeholder="e.g. senior-developer"
          className={inputClass}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Location">
          <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Type">
          <input value={type} onChange={(e) => setType(e.target.value)} placeholder="e.g. Full-time" className={inputClass} />
        </Field>
        <Field label="Salary">
          <input value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="e.g. £40k–50k" className={inputClass} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Status">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={inputClass}
          >
            <option value="draft">Draft (hidden)</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </Field>
        <Field label="Published at (ISO date)">
          <input
            type="datetime-local"
            value={published_at ? published_at.slice(0, 16) : ""}
            onChange={(e) => setPublishedAt(e.target.value ? new Date(e.target.value).toISOString() : "")}
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="Body (MDX / Markdown)">
        <textarea
          value={body_mdx}
          onChange={(e) => setBodyMdx(e.target.value)}
          rows={12}
          className={textareaClass}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Apply URL">
          <input
            type="url"
            value={apply_url}
            onChange={(e) => setApplyUrl(e.target.value)}
            placeholder="https://..."
            className={inputClass}
          />
        </Field>
        <Field label="Apply email">
          <input
            type="email"
            value={apply_email}
            onChange={(e) => setApplyEmail(e.target.value)}
            placeholder="careers@..."
            className={inputClass}
          />
        </Field>
      </div>
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
