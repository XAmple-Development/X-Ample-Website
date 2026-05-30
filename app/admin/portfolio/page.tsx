"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PortfolioItem = {
  id: string;
  title: string;
  description: string;
  category: string | null;
  image_url: string | null;
  project_url: string | null;
  sort_order: number;
  updated_at: string;
};

export default function AdminPortfolioPage() {
  const [intro, setIntro] = useState("");
  const [introSaving, setIntroSaving] = useState(false);
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/portfolio").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/admin/portfolio/items").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([page, list]) => {
        if (page) setIntro(page.intro ?? "");
        setItems(Array.isArray(list) ? list : []);
      })
      .catch(() => setError("Failed to load."))
      .finally(() => setLoading(false));
  }, []);

  async function saveIntro() {
    setIntroSaving(true);
    setError("");
    const res = await fetch("/api/admin/portfolio", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intro }),
    });
    setIntroSaving(false);
    if (!res.ok) setError("Failed to save intro.");
  }

  async function deleteItem(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setError("");
    const res = await fetch(`/api/admin/portfolio/items/${id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
    else setError("Failed to delete item.");
  }

  if (loading) return <p className="text-sm text-muted">Loading…</p>;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Portfolio</h1>
        <p className="mt-1 text-sm text-muted">Intro text and projects shown on the public Portfolio page.</p>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <section className="rounded-2xl border border-border p-6">
        <h2 className="text-sm font-semibold">Page intro</h2>
        <textarea
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
          rows={3}
          className="xa-input mt-2 min-h-[80px] py-2"
          placeholder="A curated view of Discord bots, websites, and web apps we've shipped."
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
          <h2 className="text-sm font-semibold">Projects</h2>
          <Link
            href="/admin/portfolio/items/new"
            className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            Add project
          </Link>
        </div>
        <div className="mt-4 space-y-2">
          {items.length === 0 ? (
            <p className="rounded-2xl border border-border p-5 text-sm text-muted">
              No portfolio items yet. Add one to get started.
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border p-4"
              >
                <div>
                  <span className="font-medium">{item.title}</span>
                  {item.category ? (
                    <span className="ml-2 text-sm text-muted">— {item.category}</span>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <a href="/portfolio" target="_blank" rel="noreferrer" className="text-sm text-muted underline hover:text-foreground">
                    View page
                  </a>
                  <Link href={`/admin/portfolio/items/${item.id}/edit`} className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent-muted">
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => deleteItem(item.id, item.title)}
                    className="rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
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
