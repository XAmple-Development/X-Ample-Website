"use client";

import { useEffect, useState } from "react";

type WaitlistEntry = {
  id: string;
  email: string;
  created_at: string;
};

export default function AdminWaitlistPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/waitlist")
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/admin/login";
          return [];
        }
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then((data) => setEntries(Array.isArray(data) ? data : []))
      .catch(() => setError("Failed to load waitlist."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-foreground/70">Loading…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Waitlist</h1>
        <p className="mt-1 text-sm text-foreground/70">
          People who signed up via the homepage. You receive an email (via Resend) each time someone joins.
        </p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-black/10 p-8 text-center text-sm text-foreground/70 dark:border-white/10">
          No waitlist signups yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-black/10 dark:border-white/10">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 bg-black/[.03] dark:border-white/10 dark:bg-white/[.03]">
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Signed up</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-black/5 last:border-0 dark:border-white/5"
                >
                  <td className="px-4 py-3">
                    <a href={`mailto:${e.email}`} className="text-foreground/90 underline hover:text-foreground">
                      {e.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-foreground/70">
                    {new Date(e.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-foreground/60">
        {entries.length} signup{entries.length !== 1 ? "s" : ""} total.
      </p>
    </div>
  );
}
