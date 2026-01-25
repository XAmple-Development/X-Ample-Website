import Link from "next/link";
import { Logo } from "@/components/site/Logo";
import { MobileNav } from "@/components/site/MobileNav";

const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/team", label: "Team" },
  { href: "/vacancies", label: "Vacancies" },
  { href: "/docs", label: "Docs" },
  { href: "/blog", label: "Blog" },
  { href: "/support", label: "Support" },
  { href: "/contact", label: "Contact" },
  { href: "/store", label: "Store" },
  { href: "https://discord.gg/PfUWNvnT8Y", label: "Discord" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-background/80 backdrop-blur dark:border-white/10">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm sm:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-foreground/80 transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <MobileNav items={nav} />
          <span className="hidden sm:inline-flex h-9 items-center justify-center rounded-full border border-black/15 px-4 text-sm font-medium text-foreground/80 dark:border-white/15">
            FiveM Store
          </span>
        </div>
      </div>
    </header>
  );
}

