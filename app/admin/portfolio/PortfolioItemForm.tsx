"use client";

import { useState } from "react";

type Props = {
  initial?: Record<string, string>;
  onSubmit: (data: Record<string, string | null>) => Promise<void>;
  saving: boolean;
};

const defaultInitial: Record<string, string> = {
  title: "",
  description: "",
  category: "",
  image_url: "",
  project_url: "",
  sort_order: "0",
};

const inputClass = "xa-input";
const textareaClass = "xa-input min-h-[100px] py-2";

export function PortfolioItemForm({ initial = defaultInitial, onSubmit, saving }: Props) {
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [category, setCategory] = useState(initial.category);
  const [image_url, setImageUrl] = useState(initial.image_url);
  const [project_url, setProjectUrl] = useState(initial.project_url);
  const [sort_order, setSortOrder] = useState(initial.sort_order);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      title: title.trim() || null,
      description: description.trim() || null,
      category: category.trim() || null,
      image_url: image_url.trim() || null,
      project_url: project_url.trim() || null,
      sort_order: sort_order.trim() || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Title">
        <input value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} />
      </Field>
      <Field label="Description">
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={textareaClass} />
      </Field>
      <Field label="Category">
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Discord or Web"
          className={inputClass}
        />
      </Field>
      <Field label="Image URL">
        <input
          value={image_url}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
          className={inputClass}
        />
      </Field>
      <Field label="Project URL">
        <input
          value={project_url}
          onChange={(e) => setProjectUrl(e.target.value)}
          placeholder="https://..."
          className={inputClass}
        />
      </Field>
      <Field label="Sort order">
        <input
          type="number"
          value={sort_order}
          onChange={(e) => setSortOrder(e.target.value)}
          className={inputClass}
        />
      </Field>
      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
