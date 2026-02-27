import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-black/10 px-4 py-3 dark:border-white/10">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/admin/vacancies" className="text-sm font-semibold">
            Content admin
          </Link>
          <nav className="flex gap-4 text-sm text-foreground/80">
            <Link href="/admin/vacancies" className="hover:text-foreground">
              Vacancies
            </Link>
            <Link href="/admin/team" className="hover:text-foreground">
              Team
            </Link>
            <Link href="/admin/waitlist" className="hover:text-foreground">
              Waitlist
            </Link>
            <a href="/admin" target="_blank" rel="noreferrer" className="hover:text-foreground">
              Blog (Decap)
            </a>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  );
}
