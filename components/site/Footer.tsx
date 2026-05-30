import Link from "next/link";
import { DISCORD_INVITE_URL } from "@/lib/site";

export function Footer() {
  return (
    <footer className="relative border-t border-border">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)]">
          <div>
            <p className="text-sm font-semibold">X-Ample Development</p>
            <p className="mt-2 text-sm text-muted">
              Discord bots, websites, and custom development — polished, performance-first, built for real
              communities and teams.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3 text-sm">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Support</p>
              <Link className="block text-foreground/80 transition-colors hover:text-accent" href="/support">
                Get support
              </Link>
              <Link className="block text-foreground/80 transition-colors hover:text-accent" href="/contact">
                Contact
              </Link>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Studio</p>
              <Link className="block text-foreground/80 transition-colors hover:text-accent" href="/services">
                Services
              </Link>
              <Link className="block text-foreground/80 transition-colors hover:text-accent" href="/portfolio">
                Portfolio
              </Link>
              <Link className="block text-foreground/80 transition-colors hover:text-accent" href="/about">
                About
              </Link>
              <Link className="block text-foreground/80 transition-colors hover:text-accent" href="/team">
                Team
              </Link>
              <Link className="block text-foreground/80 transition-colors hover:text-accent" href="/vacancies">
                Vacancies
              </Link>
              <Link className="block text-foreground/80 transition-colors hover:text-accent" href="/blog">
                Blog
              </Link>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Community</p>
              <Link
                className="block text-accent transition-colors hover:text-accent-hover"
                href={DISCORD_INVITE_URL}
              >
                Discord
              </Link>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} X-Ample Development. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-muted">
            <Link href="/privacy" className="hover:text-accent">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-accent">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
