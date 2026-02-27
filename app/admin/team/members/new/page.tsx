"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TeamMemberForm } from "../TeamMemberForm";

export default function NewTeamMemberPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(data: Record<string, string | null>) {
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/team/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    if (res.ok) {
      router.push("/admin/team");
      router.refresh();
    } else {
      const json = await res.json().catch(() => ({}));
      setError(json.error || "Failed to add member.");
    }
  }

  return (
    <div>
      <Link href="/admin/team" className="text-sm text-foreground/70 underline hover:text-foreground">
        ← Team
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">Add team member</h1>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      <TeamMemberForm onSubmit={handleSubmit} saving={saving} />
    </div>
  );
}
