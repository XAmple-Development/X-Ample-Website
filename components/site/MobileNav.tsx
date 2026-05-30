"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import type { NavItem } from "@/components/site/Navbar";
import { Button } from "@/components/ui/Button";

export function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="inline-flex h-9 items-center justify-center rounded-full border border-border-strong px-4 text-sm font-medium text-foreground/80"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        Menu
      </button>

      <AnimatePresence>
        {open ? (
          <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true">
            <motion.button
              type="button"
              className="absolute inset-0 bg-black/60"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
            />

            <motion.div
              className="absolute right-3 top-3 w-[calc(100%-1.5rem)] max-w-sm rounded-2xl border border-border bg-surface-elevated p-4 shadow-2xl shadow-accent/10"
              initial={reduceMotion ? false : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, x: 24 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold">Navigation</div>
                <button
                  type="button"
                  className="rounded-lg border border-border-strong px-3 py-2 text-sm hover:bg-accent-muted"
                  onClick={() => setOpen(false)}
                >
                  Close
                </button>
              </div>

              <nav className="mt-3 grid gap-1 text-sm">
                {items.map((item) => {
                  const isExternal = item.external || /^https?:\/\//i.test(item.href);
                  const className =
                    "rounded-lg px-3 py-2.5 transition-colors hover:bg-accent-muted " +
                    (item.label === "Discord" ? "text-accent" : "text-foreground/90");

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

              <div className="mt-4 border-t border-border pt-4">
                <Button href="/contact" variant="primary" className="w-full" onClick={() => setOpen(false)}>
                  Contact
                </Button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
