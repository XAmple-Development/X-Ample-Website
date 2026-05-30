import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/admin/vacancies" className="text-sm font-semibold">
            Content admin
          </Link>
          <nav className="flex flex-wrap justify-end gap-x-4 gap-y-1 text-sm text-muted">
            <Link href="/admin/vacancies" className="transition-colors hover:text-accent">
              Vacancies
            </Link>
            <Link href="/admin/portfolio" className="transition-colors hover:text-accent">
              Portfolio
            </Link>
            <Link href="/admin/team" className="transition-colors hover:text-accent">
              Team
            </Link>
            <Link href="/admin/newsletter" className="transition-colors hover:text-accent">
              Newsletter
            </Link>
            <a href="/cms" target="_blank" rel="noreferrer" className="transition-colors hover:text-accent">
              Blog (Decap)
            </a>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  );
}
