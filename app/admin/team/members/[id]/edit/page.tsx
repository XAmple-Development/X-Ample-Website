"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { TeamMemberForm } from "../../TeamMemberForm";

type Member = {
  id: string;
  name: string;
  role: string | null;
  bio: string | null;
  avatar_url: string | null;
  discord_url: string | null;
  github_url: string | null;
  twitter_url: string | null;
  sort_order: number;
};

export default function EditTeamMemberPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/team/members/${id}`)
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/admin/login";
          return null;
        }
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then(setMember)
      .catch(() => setError("Failed to load member."))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(data: Record<string, string | null>) {
    setSaving(true);
    setError("");
    const res = await fetch(`/api/admin/team/members/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    if (res.ok) {
      router.push("/admin/team");
      router.refresh();
    } else {
      const json = await res.json().catch(() => ({}));
      setError(json.error || "Failed to update member.");
    }
  }

  if (loading) return <p className="text-sm text-foreground/70">Loading…</p>;
  if (!member) return <p className="text-sm text-red-600">{error || "Not found."}</p>;

  const initial = {
    name: member.name,
    role: member.role ?? "",
    bio: member.bio ?? "",
    avatar_url: member.avatar_url ?? "",
    discord_url: member.discord_url ?? "",
    github_url: member.github_url ?? "",
    twitter_url: member.twitter_url ?? "",
    sort_order: String(member.sort_order),
  };

  return (
    <div>
      <Link href="/admin/team" className="text-sm text-foreground/70 underline hover:text-foreground">
        ← Team
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">Edit team member</h1>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      <TeamMemberForm initial={initial} onSubmit={handleSubmit} saving={saving} />
    </div>
  );
}
