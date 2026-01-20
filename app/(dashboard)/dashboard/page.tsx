import { supabaseAdmin } from "@/lib/supabase";
import { getSessionFromCookies } from "@/lib/session";

export const runtime = "nodejs";

export default async function DashboardHome() {
  const session = await getSessionFromCookies();
  if (!session) return null;

  const sb = supabaseAdmin();
  const { data: tickets } = await sb
    .from("tickets")
    .select("id, status")
    .eq("user_id", session.userId)
    .limit(50);

  const { data: purchases } = await sb
    .from("purchases")
    .select("id")
    .eq("user_id", session.userId)
    .limit(50);

  const openTickets = (tickets ?? []).filter((t) => t.status !== "closed").length;
  const purchaseCount = (purchases ?? []).length;

  return (
    <div className="rounded-xl border p-5">
      <h1 className="text-xl font-semibold">Welcome{session.username ? `, ${session.username}` : ""}</h1>
      <p className="mt-2 text-sm opacity-75">
        From here you can view your purchases, open support tickets, and manage your profile settings.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Stat title="Purchases" value={String(purchaseCount)} hint="Synced via Tebex webhook" />
        <Stat title="Open tickets" value={String(openTickets)} hint="Support requests & replies" />
      </div>
    </div>
  );
}

function Stat({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border p-4">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-1 text-3xl font-semibold">{value}</div>
      <div className="mt-2 text-xs opacity-70">{hint}</div>
    </div>
  );
}

