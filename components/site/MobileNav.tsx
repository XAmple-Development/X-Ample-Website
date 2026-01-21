"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export type NavItem = { href: string; label: string };

export function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        className="inline-flex h-9 items-center justify-center rounded-full border border-black/15 px-4 text-sm font-medium text-foreground/80 dark:border-white/15"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        Menu
      </button>

      {open ? (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-3 top-3 w-[calc(100%-1.5rem)] max-w-sm rounded-2xl border border-black/10 bg-background p-4 shadow-xl dark:border-white/10">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold">Navigation</div>
              <button
                type="button"
                className="rounded-lg border border-black/15 px-3 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>

            <nav className="mt-3 grid gap-1 text-sm">
              {items.map((item) => {
                const isExternal = /^https?:\/\//i.test(item.href);
                const className = "rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5";

                if (isExternal) {
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className={className}
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </a>
                  );
                }

                return (
                  <Link key={item.href} href={item.href} className={className} onClick={() => setOpen(false)}>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}

