"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type TeamMember = {
  id: string;
  name: string;
  role: string | null;
  bio: string | null;
  avatar_url: string | null;
  discord_url: string | null;
  github_url: string | null;
  twitter_url: string | null;
  sort_order: number;
  updated_at: string;
};

export default function AdminTeamPage() {
  const [intro, setIntro] = useState("");
  const [introSaving, setIntroSaving] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/team").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/admin/team/members").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([page, list]) => {
        if (page) setIntro(page.intro ?? "");
        setMembers(Array.isArray(list) ? list : []);
      })
      .catch(() => setError("Failed to load."))
      .finally(() => setLoading(false));
  }, []);

  async function saveIntro() {
    setIntroSaving(true);
    setError("");
    const res = await fetch("/api/admin/team", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intro }),
    });
    setIntroSaving(false);
    if (!res.ok) setError("Failed to save intro.");
  }

  async function deleteMember(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setError("");
    const res = await fetch(`/api/admin/team/members/${id}`, { method: "DELETE" });
    if (res.ok) setMembers((prev) => prev.filter((m) => m.id !== id));
    else setError("Failed to delete member.");
  }

  if (loading) return <p className="text-sm text-foreground/70">Loading…</p>;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Team</h1>
        <p className="mt-1 text-sm text-foreground/70">Intro text and team members shown on the public Team page.</p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <section className="rounded-2xl border border-black/10 p-6 dark:border-white/10">
        <h2 className="text-sm font-semibold">Page intro</h2>
        <textarea
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
          rows={3}
          className="mt-2 w-full rounded-xl border border-black/15 bg-background px-3 py-2 text-sm outline-none ring-0 focus:border-black/40 dark:border-white/15 dark:focus:border-white/35"
          placeholder="Meet the people behind X-Ample."
        />
        <button
          type="button"
          onClick={saveIntro}
          disabled={introSaving}
          className="mt-3 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-60"
        >
          {introSaving ? "Saving…" : "Save intro"}
        </button>
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-sm font-semibold">Team members</h2>
          <Link
            href="/admin/team/members/new"
            className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            Add member
          </Link>
        </div>
        <div className="mt-4 space-y-2">
          {members.length === 0 ? (
            <p className="rounded-2xl border border-black/10 p-5 text-sm text-foreground/70 dark:border-white/10">
              No team members yet. Add one to get started.
            </p>
          ) : (
            members.map((m) => (
              <div
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/10 p-4 dark:border-white/10"
              >
                <div className="flex items-center gap-3">
                  {m.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.avatar_url} alt="" className="h-12 w-12 rounded-xl object-cover" />
                  ) : (
                    <div className="h-12 w-12 rounded-xl bg-black/10 dark:bg-white/10" />
                  )}
                  <div>
                    <span className="font-medium">{m.name}</span>
                    {m.role ? <span className="ml-2 text-sm text-foreground/70">— {m.role}</span> : null}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a href="/team" target="_blank" rel="noreferrer" className="text-sm text-foreground/70 underline hover:text-foreground">
                    View page
                  </a>
                  <Link href={`/admin/team/members/${m.id}/edit`} className="rounded-lg border px-3 py-2 text-sm hover:bg-black/5">
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => deleteMember(m.id, m.name)}
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
