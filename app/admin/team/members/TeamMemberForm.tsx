"use client";

import { useState } from "react";

type Props = {
  initial?: Record<string, string>;
  onSubmit: (data: Record<string, string | null>) => Promise<void>;
  saving: boolean;
};

const defaultInitial: Record<string, string> = {
  name: "",
  role: "",
  bio: "",
  avatar_url: "",
  discord_url: "",
  github_url: "",
  twitter_url: "",
  sort_order: "0",
};

const inputClass =
  "h-11 w-full rounded-xl border border-black/15 bg-background px-3 text-sm outline-none ring-0 focus:border-black/40 dark:border-white/15 dark:focus:border-white/35";
const textareaClass =
  "w-full min-h-[100px] rounded-xl border border-black/15 bg-background px-3 py-2 text-sm outline-none ring-0 focus:border-black/40 dark:border-white/15 dark:focus:border-white/35";

export function TeamMemberForm({ initial = defaultInitial, onSubmit, saving }: Props) {
  const [name, setName] = useState(initial.name);
  const [role, setRole] = useState(initial.role);
  const [bio, setBio] = useState(initial.bio);
  const [avatar_url, setAvatarUrl] = useState(initial.avatar_url);
  const [discord_url, setDiscordUrl] = useState(initial.discord_url);
  const [github_url, setGithubUrl] = useState(initial.github_url);
  const [twitter_url, setTwitterUrl] = useState(initial.twitter_url);
  const [sort_order, setSortOrder] = useState(initial.sort_order);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      name: name.trim() || null,
      role: role.trim() || null,
      bio: bio.trim() || null,
      avatar_url: avatar_url.trim() || null,
      discord_url: discord_url.trim() || null,
      github_url: github_url.trim() || null,
      twitter_url: twitter_url.trim() || null,
      sort_order: sort_order.trim() || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <Field label="Name" required>
        <input value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
      </Field>
      <Field label="Role">
        <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Founder & Developer" className={inputClass} />
      </Field>
      <Field label="Bio">
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className={textareaClass} />
      </Field>
      <Field label="Avatar URL">
        <input
          type="url"
          value={avatar_url}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://... or /uploads/..."
          className={inputClass}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Discord URL">
          <input type="url" value={discord_url} onChange={(e) => setDiscordUrl(e.target.value)} className={inputClass} />
        </Field>
        <Field label="GitHub URL">
          <input type="url" value={github_url} onChange={(e) => setGithubUrl(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Twitter/X URL">
          <input type="url" value={twitter_url} onChange={(e) => setTwitterUrl(e.target.value)} className={inputClass} />
        </Field>
      </div>
      <Field label="Sort order (lower = first)">
        <input type="number" value={sort_order} onChange={(e) => setSortOrder(e.target.value)} className={inputClass} />
      </Field>
      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-foreground px-6 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </form>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
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
