import { getSessionFromCookies } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export default async function SettingsPage() {
  const session = await getSessionFromCookies();
  if (!session) return null;

  const sb = supabaseAdmin();
  const { data: user } = await sb
    .from("users")
    .select("tebex_customer_id, username, email, display_name, discord_tag")
    .eq("id", session.userId)
    .maybeSingle();

  return (
    <div className="rounded-xl border p-5">
      <h1 className="text-xl font-semibold">Profile settings</h1>
      <p className="mt-2 text-sm opacity-75">Update how we contact you for support.</p>

      <form className="mt-6 space-y-3" action="/api/dashboard/settings" method="post">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <div className="text-sm font-medium">Display name</div>
            <input
              name="display_name"
              defaultValue={user?.display_name ?? ""}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <div className="text-sm font-medium">Discord tag</div>
            <input
              name="discord_tag"
              defaultValue={user?.discord_tag ?? ""}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              placeholder="name#1234"
            />
          </label>
        </div>

        <div className="rounded-lg border p-3 text-xs opacity-75">
          <div>
            <span className="font-medium">Tebex customer id:</span> {user?.tebex_customer_id ?? "—"}
          </div>
          <div>
            <span className="font-medium">Username:</span> {user?.username ?? "—"}
          </div>
          <div>
            <span className="font-medium">Email:</span> {user?.email ?? "—"}
          </div>
        </div>

        <button className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:opacity-90" type="submit">
          Save changes
        </button>
      </form>
    </div>
  );
}

