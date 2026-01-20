import Link from "next/link";
import { getSessionFromCookies } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export default async function TicketsPage() {
  const session = await getSessionFromCookies();
  if (!session) return null;

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("tickets")
    .select("id, subject, status, priority, created_at, updated_at")
    .eq("user_id", session.userId)
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error) return <div className="text-sm text-red-600">Failed to load tickets.</div>;

  const tickets = data ?? [];

  return (
    <div className="rounded-xl border p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Support tickets</h1>
          <p className="mt-2 text-sm opacity-75">Open a ticket and we’ll get back to you.</p>
        </div>
        <Link
          href="/dashboard/tickets/new"
          className="rounded-lg bg-black px-3 py-2 text-sm text-white hover:opacity-90"
        >
          New ticket
        </Link>
      </div>

      {tickets.length === 0 ? (
        <div className="mt-4 text-sm opacity-70">No tickets yet.</div>
      ) : (
        <div className="mt-6 space-y-2">
          {tickets.map((t) => (
            <Link
              key={t.id}
              href={`/dashboard/tickets/${t.id}`}
              className="block rounded-xl border p-4 hover:bg-black/5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="text-sm font-semibold">{t.subject}</div>
                <div className="text-xs opacity-70">
                  {t.status} · {t.priority}
                </div>
              </div>
              <div className="mt-1 text-xs opacity-70">
                Updated {new Date(t.updated_at).toLocaleString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

