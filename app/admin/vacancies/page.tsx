"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type VacancyRow = {
  id: string;
  slug: string;
  title: string;
  location: string | null;
  type: string | null;
  salary: string | null;
  status: string;
  published_at: string | null;
  updated_at: string;
};

export default function AdminVacanciesPage() {
  const [list, setList] = useState<VacancyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/vacancies")
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/admin/login";
          return [];
        }
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then(setList)
      .catch(() => setError("Failed to load vacancies."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-foreground/70">Loading…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Vacancies</h1>
        <Link
          href="/admin/vacancies/new"
          className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          New vacancy
        </Link>
      </div>
      <p className="mt-2 text-sm text-foreground/70">
        Open and draft roles appear on the site when status is &quot;open&quot; and published date is set.
      </p>
      <div className="mt-6 space-y-2">
        {list.length === 0 ? (
          <p className="rounded-2xl border border-black/10 p-5 text-sm text-foreground/70 dark:border-white/10">
            No vacancies yet. Create one to get started.
          </p>
        ) : (
          list.map((v) => (
            <div
              key={v.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/10 p-4 dark:border-white/10"
            >
              <div>
                <span className="font-medium">{v.title}</span>
                <span className="ml-2 rounded-full border px-2 py-0.5 text-xs opacity-80">{v.status}</span>
                {v.slug ? <span className="ml-2 text-xs text-foreground/60">/{v.slug}</span> : null}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/vacancies/${v.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-foreground/70 underline hover:text-foreground"
                >
                  View
                </a>
                <Link
                  href={`/admin/vacancies/${v.id}/edit`}
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
