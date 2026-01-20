import { getSessionFromCookies } from "@/lib/session";
import { isAdminForCustomerId } from "@/lib/auth";

export const runtime = "nodejs";

export default async function AdminPage() {
  const session = await getSessionFromCookies();
  if (!session) return null;

  const isAdmin = isAdminForCustomerId(session.tebexCustomerId);

  if (!isAdmin) {
    return (
      <div className="rounded-xl border p-5">
        <h1 className="text-xl font-semibold">Admin</h1>
        <p className="mt-2 text-sm opacity-75">You don’t have access to the admin dashboard.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-5">
      <h1 className="text-xl font-semibold">Admin</h1>
      <p className="mt-2 text-sm opacity-75">
        Admin tools will live here (tickets triage, purchase lookup, user management).
      </p>

      <div className="mt-6 rounded-xl border p-4 text-sm">
        Next: we’ll wire this to `/api/dashboard/admin/*` endpoints (tickets + purchases).
      </div>
    </div>
  );
}

