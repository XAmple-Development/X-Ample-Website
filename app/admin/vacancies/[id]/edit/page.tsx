"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { VacancyForm } from "../../VacancyForm";

type Vacancy = {
  id: string;
  slug: string;
  title: string;
  location: string | null;
  type: string | null;
  salary: string | null;
  status: string;
  published_at: string | null;
  body_mdx: string;
  apply_url: string | null;
  apply_email: string | null;
};

export default function EditVacancyPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/vacancies/${id}`)
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/admin/login";
          return null;
        }
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then(setVacancy)
      .catch(() => setError("Failed to load vacancy."))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(data: Record<string, string | null>) {
    setSaving(true);
    setError("");
    const res = await fetch(`/api/admin/vacancies/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    setSaving(false);
    if (res.ok) {
      router.push("/admin/vacancies");
      router.refresh();
    } else {
      setError(json.error || "Failed to update vacancy.");
    }
  }

  if (loading) return <p className="text-sm text-foreground/70">Loading…</p>;
  if (!vacancy) return <p className="text-sm text-red-600">{error || "Not found."}</p>;

  const initial = {
    title: vacancy.title,
    slug: vacancy.slug,
    location: vacancy.location ?? "",
    type: vacancy.type ?? "",
    salary: vacancy.salary ?? "",
    status: vacancy.status,
    published_at: vacancy.published_at ?? "",
    body_mdx: vacancy.body_mdx ?? "",
    apply_url: vacancy.apply_url ?? "",
    apply_email: vacancy.apply_email ?? "",
  };

  return (
    <div>
      <Link href="/admin/vacancies" className="text-sm text-foreground/70 underline hover:text-foreground">
        ← Vacancies
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">Edit vacancy</h1>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      <VacancyForm initial={initial} onSubmit={handleSubmit} saving={saving} />
    </div>
  );
}
