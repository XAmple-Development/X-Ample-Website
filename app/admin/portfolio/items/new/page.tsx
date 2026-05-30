"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { PortfolioItemForm } from "../../PortfolioItemForm";

export default function NewPortfolioItemPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(data: Record<string, string | null>) {
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/portfolio/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    if (res.ok) {
      router.push("/admin/portfolio");
      router.refresh();
    } else {
      const json = await res.json().catch(() => ({}));
      setError(typeof json.error === "string" ? json.error : "Failed to create.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/portfolio" className="text-sm text-muted underline hover:text-foreground">
          Back to portfolio
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Add project</h1>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <PortfolioItemForm onSubmit={handleSubmit} saving={saving} />
    </div>
  );
}
