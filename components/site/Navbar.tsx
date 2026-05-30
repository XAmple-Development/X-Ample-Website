import Link from "next/link";
import { Logo } from "@/components/site/Logo";
import { MobileNav } from "@/components/site/MobileNav";
import { Button } from "@/components/ui/Button";

export type NavItem = { href: string; label: string; external?: boolean };

const nav: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/about", label: "About" },
  { href: "/team", label: "Team" },
  { href: "/blog", label: "Blog" },
  { href: "/support", label: "Support" },
  { href: "https://discord.gg/PfUWNvnT8Y", label: "Discord", external: true },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-1 text-sm lg:flex">
          {nav.map((item) => {
            const isDiscord = item.label === "Discord";
            const className = isDiscord
              ? "rounded-full px-3 py-1.5 text-accent transition-colors hover:bg-accent-muted"
              : "rounded-full px-3 py-1.5 text-foreground/75 transition-colors hover:text-foreground hover:bg-accent-muted";

            if (item.external) {
              return (
                <a key={item.href} href={item.href} target="_blank" rel="noreferrer" className={className}>
                  {item.label}
                </a>
              );
            }

            return (
              <Link key={item.href} href={item.href} className={className}>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Button href="/contact" variant="primary" className="hidden h-9 px-5 text-xs sm:inline-flex">
            Contact
          </Button>
          <MobileNav items={nav} />
        </div>
      </div>
    </header>
  );
}
