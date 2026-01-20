import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createDashboardSessionFromBasketIdent } from "@/lib/createDashboardSession";

export const runtime = "nodejs";

export default async function DashboardAuthPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const ident = typeof sp.ident === "string" ? sp.ident.trim() : "";

  if (!ident) {
    redirect("/store?error=missing_ident");
  }

  // Some deployments may have transient env/config issues; fail closed back to /store.
  try {
    await createDashboardSessionFromBasketIdent(ident);
  } catch {
    // Make sure cookies are readable to avoid Next pruning tree on unused import.
    void cookies;
    redirect("/store?error=dashboard_session_failed");
  }

  redirect("/dashboard");
}

