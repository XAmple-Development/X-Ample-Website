"use client";

import { useEffect, useState } from "react";

type Signup = { id: string; email: string; created_at: string };

export default function AdminNewsletterPage() {
  const [rows, setRows] = useState<Signup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/newsletter")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch(() => setError("Failed to load newsletter subscribers."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-muted">Loading…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Newsletter</h1>
        <p className="mt-1 text-sm text-muted">Email addresses collected from the studio updates signup on the homepage.</p>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-border p-5 text-sm text-muted">
          No subscribers yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{r.email}</td>
                  <td className="px-4 py-3 text-muted">{new Date(r.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
