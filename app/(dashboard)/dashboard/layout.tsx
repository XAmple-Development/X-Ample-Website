import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/session";
import { isAdminForSession } from "@/lib/admin";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export const runtime = "nodejs";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSessionFromCookies();
  if (!session) redirect("/store?error=login_required");

  const isAdmin = await isAdminForSession(session);

  return (
    <div className="grid gap-6 md:grid-cols-[260px_1fr]">
      <DashboardNav username={session.username} isAdmin={isAdmin} />
      <section className="min-w-0">{children}</section>
    </div>
  );
}

