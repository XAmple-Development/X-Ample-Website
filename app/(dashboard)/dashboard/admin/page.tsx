import { getSessionFromCookies } from "@/lib/session";
import { isAdminForSession } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase";
import Link from "next/link";
import { formatCurrency } from "@/lib/money";
import { getSystemState } from "@/lib/systemState";

export const runtime = "nodejs";

export default async function AdminPage() {
  const session = await getSessionFromCookies();
  if (!session) return null;

  const isAdmin = await isAdminForSession(session);

  if (!isAdmin) {
    return (
      <div className="rounded-xl border p-5">
        <h1 className="text-xl font-semibold">Admin</h1>
        <p className="mt-2 text-sm opacity-75">You don’t have access to the admin dashboard.</p>
      </div>
    );
  }

  const sb = supabaseAdmin();
  const [webhookState, pluginState, { data: tickets }, { data: purchases }] = await Promise.all([
    getSystemState("tebex_webhook"),
    getSystemState("plugin_sync"),
    sb
      .from("tickets")
      .select("id, user_id, subject, status, priority, updated_at")
      .order("updated_at", { ascending: false })
      .limit(20),
    sb
      .from("purchases")
      .select("id, user_id, tebex_payment_id, total, currency, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const webhookLast = (webhookState?.value?.lastSeenAt as string | undefined) ?? webhookState?.updated_at ?? null;
  const pluginLastOk = (pluginState?.value?.lastSuccessAt as string | undefined) ?? null;
  const pluginLastErr = (pluginState?.value?.lastErrorAt as string | undefined) ?? null;
  const pluginUpserted = (pluginState?.value?.upserted as number | undefined) ?? null;
  const pluginScanned = (pluginState?.value?.scanned as number | undefined) ?? null;

  return (
    <div className="rounded-xl border p-5">
      <h1 className="text-xl font-semibold">Admin</h1>
      <p className="mt-2 text-sm opacity-75">Recent activity across tickets and purchases.</p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border p-4">
          <div className="text-sm font-semibold">Webhook health</div>
          <div className="mt-2 text-sm opacity-80">
            {webhookLast ? `Last webhook: ${new Date(webhookLast).toLocaleString()}` : "No webhook activity recorded yet."}
          </div>
          <div className="mt-1 text-xs opacity-70">
            Endpoint: <code className="opacity-90">/api/tebex/webhook</code>
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="text-sm font-semibold">Plugin sync health</div>
          <div className="mt-2 text-sm opacity-80">
            {pluginLastOk ? `Last success: ${new Date(pluginLastOk).toLocaleString()}` : "No successful sync recorded yet."}
          </div>
          {pluginUpserted != null ? (
            <div className="mt-1 text-xs opacity-70">
              Upserted: {pluginUpserted}
              {pluginScanned != null ? ` (scanned: ${pluginScanned})` : ""}
            </div>
          ) : null}
          {pluginLastErr ? (
            <div className="mt-2 text-xs text-red-600">
              Last error: {new Date(pluginLastErr).toLocaleString()}
            </div>
          ) : null}
        </div>
      </div>

      <form className="mt-4" action="/api/dashboard/admin/sync-purchases" method="post">
        <button className="rounded-lg border px-3 py-2 text-sm hover:bg-black/5" type="submit">
          Sync purchases (Plugin API)
        </button>
      </form>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border p-4">
          <div className="flex items-baseline justify-between gap-3">
            <div className="text-sm font-semibold">Recent tickets</div>
            <Link className="text-sm underline opacity-80 hover:opacity-100" href="/dashboard/tickets">
              View all
            </Link>
          </div>

          <div className="mt-3 space-y-2">
            {(tickets ?? []).length ? (
              (tickets ?? []).map((t) => (
                <Link
                  key={t.id}
                  href={`/dashboard/tickets/${t.id}`}
                  className="block rounded-lg border p-3 hover:bg-black/5"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="min-w-0 truncate text-sm font-medium">{t.subject}</div>
                    <div className="text-[11px] opacity-70">
                      {t.status} · {t.priority}
                    </div>
                  </div>
                  <div className="mt-1 text-[11px] opacity-60">
                    Updated {new Date(t.updated_at).toLocaleString()}
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-sm opacity-70">No tickets found.</div>
            )}
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="flex items-baseline justify-between gap-3">
            <div className="text-sm font-semibold">Recent purchases</div>
            <Link className="text-sm underline opacity-80 hover:opacity-100" href="/dashboard/purchases">
              View mine
            </Link>
          </div>

          <div className="mt-3 space-y-2">
            {(purchases ?? []).length ? (
              (purchases ?? []).map((p) => (
                <div key={p.id} className="rounded-lg border p-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="text-sm font-medium">Payment: {p.tebex_payment_id}</div>
                    <div className="text-[11px] opacity-70">
                      {p.total != null ? formatCurrency(Number(p.total), p.currency ?? null) : "—"}
                    </div>
                  </div>
                  <div className="mt-1 text-[11px] opacity-60">
                    {new Date(p.created_at).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm opacity-70">No purchases found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

