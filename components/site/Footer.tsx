import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-black/10 py-10 dark:border-white/10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)]">
          <div>
            <p className="text-sm font-semibold">X-Ample Development</p>
            <p className="mt-1 text-sm text-foreground/70">
              Also known as X-Ample Studios.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 text-sm">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
                Support
              </p>
              <Link className="block text-foreground/80 hover:text-foreground" href="/support">
                Get support
              </Link>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
                Studio
              </p>
              <Link className="block text-foreground/80 hover:text-foreground" href="/services">
                Services
              </Link>
              <Link className="block text-foreground/80 hover:text-foreground" href="/about">
                About
              </Link>
              <Link className="block text-foreground/80 hover:text-foreground" href="/team">
                Team
              </Link>
              <Link className="block text-foreground/80 hover:text-foreground" href="/vacancies">
                Vacancies
              </Link>
              <Link className="block text-foreground/80 hover:text-foreground" href="/blog">
                Blog
              </Link>
              <Link className="block text-foreground/80 hover:text-foreground" href="/contact">
                Contact
              </Link>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
                Community
              </p>
              <Link
                className="block text-foreground/80 hover:text-foreground"
                href="https://discord.gg/PfUWNvnT8Y"
              >
                Discord
              </Link>
            </div>
          </div>
        </div>
        <p className="text-xs text-foreground/60">
          © {new Date().getFullYear()} X-Ample Development. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

