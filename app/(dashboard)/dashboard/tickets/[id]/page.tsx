import { getSessionFromCookies } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdminForCustomerId } from "@/lib/auth";

export const runtime = "nodejs";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSessionFromCookies();
  if (!session) return null;

  const { id } = await params;
  const ticketId = id.trim();

  const sb = supabaseAdmin();
  const ticketRes = await sb
    .from("tickets")
    .select("id, user_id, subject, status, priority, created_at, updated_at")
    .eq("id", ticketId)
    .maybeSingle();

  if (ticketRes.error || !ticketRes.data) {
    return <div className="text-sm opacity-70">Ticket not found.</div>;
  }

  const isAdmin = isAdminForCustomerId(session.tebexCustomerId);
  if (!isAdmin && ticketRes.data.user_id !== session.userId) {
    return <div className="text-sm text-red-600">You don’t have access to this ticket.</div>;
  }

  const msgsRes = await sb
    .from("ticket_messages")
    .select("id, author_user_id, body, created_at")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true })
    .limit(500);

  const messages = msgsRes.data ?? [];

  return (
    <div className="rounded-xl border p-5">
      <h1 className="text-xl font-semibold">{ticketRes.data.subject}</h1>
      <div className="mt-2 text-xs opacity-70">
        {ticketRes.data.status} · {ticketRes.data.priority} · Updated{" "}
        {new Date(ticketRes.data.updated_at).toLocaleString()}
      </div>

      {isAdmin ? (
        <form
          className="mt-4 rounded-xl border p-4"
          action={`/api/dashboard/admin/tickets/${encodeURIComponent(ticketId)}`}
          method="post"
        >
          <div className="text-sm font-semibold">Admin actions</div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <div className="text-sm font-medium">Status</div>
              <select
                name="status"
                defaultValue={ticketRes.data.status}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              >
                <option value="open">open</option>
                <option value="pending">pending</option>
                <option value="closed">closed</option>
              </select>
            </label>
            <label className="block">
              <div className="text-sm font-medium">Priority</div>
              <select
                name="priority"
                defaultValue={ticketRes.data.priority}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              >
                <option value="low">low</option>
                <option value="normal">normal</option>
                <option value="high">high</option>
              </select>
            </label>
          </div>
          <button
            className="mt-3 rounded-lg bg-black px-4 py-2 text-sm text-white hover:opacity-90"
            type="submit"
          >
            Update ticket
          </button>
        </form>
      ) : null}

      <div className="mt-6 space-y-2">
        {messages.length ? (
          messages.map((m) => {
            const mine = m.author_user_id === session.userId;
            return (
              <div
                key={m.id}
                className={`rounded-xl border p-3 ${mine ? "bg-black/5" : ""}`}
              >
                <div className="text-xs opacity-70">
                  {mine ? "You" : "Support"} · {new Date(m.created_at).toLocaleString()}
                </div>
                <div className="mt-2 whitespace-pre-wrap text-sm">{m.body}</div>
              </div>
            );
          })
        ) : (
          <div className="text-sm opacity-70">No messages yet.</div>
        )}
      </div>

      <form className="mt-6 space-y-2" action={`/api/dashboard/tickets/${encodeURIComponent(ticketId)}/messages`} method="post">
        <div className="text-sm font-medium">Reply</div>
        <textarea
          name="body"
          required
          rows={5}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          placeholder="Write your message…"
        />
        <button className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:opacity-90" type="submit">
          Send
        </button>
      </form>
    </div>
  );
}

