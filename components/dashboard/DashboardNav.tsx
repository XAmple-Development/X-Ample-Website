"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const items = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/purchases", label: "Purchases" },
  { href: "/dashboard/tickets", label: "Support tickets" },
  { href: "/dashboard/settings", label: "Profile settings" },
  { href: "/dashboard/admin", label: "Admin" },
];

export function DashboardNav({
  username,
  isAdmin,
}: {
  username?: string | null;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/session/logout", { method: "POST" });
    } finally {
      router.push("/store");
      router.refresh();
      setBusy(false);
    }
  }

  return (
    <aside className="rounded-xl border p-4">
      <div className="text-sm font-semibold">Dashboard</div>
      <div className="mt-1 text-xs opacity-70">{username ? `Signed in as ${username}` : "Signed in"}</div>
      {!isAdmin ? <div className="mt-1 text-[11px] opacity-60">Admin hidden unless allowed.</div> : null}

      <nav className="mt-4 space-y-1">
        {items
          .filter((i) => (i.href === "/dashboard/admin" ? isAdmin : true))
          .map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm ${
                  active ? "bg-black text-white" : "hover:bg-black/5"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
      </nav>

      <button
        className="mt-4 w-full rounded-lg border px-3 py-2 text-sm hover:bg-black/5 disabled:opacity-60"
        onClick={logout}
        disabled={busy}
      >
        {busy ? "Signing out…" : "Sign out"}
      </button>
    </aside>
  );
}

