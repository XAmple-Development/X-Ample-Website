import { getSessionFromCookies } from "@/lib/session";

export const runtime = "nodejs";

export default async function NewTicketPage() {
  const session = await getSessionFromCookies();
  if (!session) return null;

  return (
    <div className="rounded-xl border p-5">
      <h1 className="text-xl font-semibold">New ticket</h1>
      <p className="mt-2 text-sm opacity-75">This form will post into your ticket system.</p>

      <form className="mt-6 space-y-3" action="/api/dashboard/tickets" method="post">
        <label className="block">
          <div className="text-sm font-medium">Subject</div>
          <input
            name="subject"
            required
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
            placeholder="e.g. Install help / Billing issue / Bug report"
          />
        </label>
        <label className="block">
          <div className="text-sm font-medium">Message</div>
          <textarea
            name="message"
            required
            rows={6}
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
            placeholder="Tell us what you need help with…"
          />
        </label>

        <button className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:opacity-90" type="submit">
          Create ticket
        </button>
      </form>
    </div>
  );
}

