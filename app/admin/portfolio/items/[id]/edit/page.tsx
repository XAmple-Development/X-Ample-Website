"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PortfolioItemForm } from "../../../PortfolioItemForm";

export default function EditPortfolioItemPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [initial, setInitial] = useState<Record<string, string> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    params.then(({ id: itemId }) => {
      setId(itemId);
      fetch(`/api/admin/portfolio/items/${itemId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) {
            setInitial({
              title: data.title ?? "",
              description: data.description ?? "",
              category: data.category ?? "",
              image_url: data.image_url ?? "",
              project_url: data.project_url ?? "",
              sort_order: String(data.sort_order ?? 0),
            });
          } else {
            setError("Not found.");
          }
        })
        .catch(() => setError("Failed to load."));
    });
  }, [params]);

  async function handleSubmit(data: Record<string, string | null>) {
    if (!id) return;
    setSaving(true);
    setError("");
    const res = await fetch(`/api/admin/portfolio/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    if (res.ok) {
      router.push("/admin/portfolio");
      router.refresh();
    } else {
      const json = await res.json().catch(() => ({}));
      setError(typeof json.error === "string" ? json.error : "Failed to save.");
    }
  }

  if (!initial && !error) return <p className="text-sm text-muted">Loading…</p>;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/portfolio" className="text-sm text-muted underline hover:text-foreground">
          Back to portfolio
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Edit project</h1>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {initial ? <PortfolioItemForm initial={initial} onSubmit={handleSubmit} saving={saving} /> : null}
    </div>
  );
}
