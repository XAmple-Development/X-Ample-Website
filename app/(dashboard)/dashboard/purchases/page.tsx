import { getSessionFromCookies } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import { formatCurrency } from "@/lib/money";

export const runtime = "nodejs";

export default async function PurchasesPage() {
  const session = await getSessionFromCookies();
  if (!session) return null;

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("purchases")
    .select("id, tebex_payment_id, total, currency, created_at, purchase_items(id, name, quantity, price, currency)")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return <div className="text-sm text-red-600">Failed to load purchases.</div>;
  }

  const purchases = data ?? [];

  return (
    <div className="rounded-xl border p-5">
      <h1 className="text-xl font-semibold">Purchases</h1>
      <p className="mt-2 text-sm opacity-75">Your Tebex purchases (synced via webhook).</p>

      {purchases.length === 0 ? (
        <div className="mt-4 text-sm opacity-70">No purchases yet.</div>
      ) : (
        <div className="mt-6 space-y-3">
          {purchases.map((p) => {
            const items = (p as any).purchase_items ?? [];
            return (
              <div key={p.id} className="rounded-xl border p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="text-sm font-semibold">Payment: {p.tebex_payment_id}</div>
                  <div className="text-sm opacity-80">
                    {p.total != null ? formatCurrency(Number(p.total), p.currency ?? null) : "Total unavailable"}
                  </div>
                </div>
                <div className="mt-1 text-xs opacity-70">{new Date(p.created_at).toLocaleString()}</div>

                {items.length ? (
                  <ul className="mt-3 space-y-1 text-sm">
                    {items.map((it: any) => (
                      <li key={it.id} className="flex justify-between gap-3">
                        <span className="min-w-0 truncate">
                          {it.name ?? "Item"} {it.quantity ? <span className="opacity-70">×{it.quantity}</span> : null}
                        </span>
                        <span className="shrink-0 opacity-80">
                          {it.price != null ? formatCurrency(Number(it.price), it.currency ?? p.currency ?? null) : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-3 text-xs opacity-70">Items will appear once a webhook is received.</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

