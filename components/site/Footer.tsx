import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-black/10 py-10 dark:border-white/10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold">X-Ample Development</p>
            <p className="text-sm text-foreground/70">
              Also known as X-Ample Studios.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link className="text-foreground/80 hover:text-foreground" href="/">
              Home
            </Link>
            <Link
              className="text-foreground/80 hover:text-foreground"
              href="/blog"
            >
              Blog
            </Link>
            <Link
              className="text-foreground/80 hover:text-foreground"
              href="/store"
            >
              Store
            </Link>
            <Link
              className="text-foreground/80 hover:text-foreground"
              href="/contact"
            >
              Contact
            </Link>
          </div>
        </div>
        <p className="text-xs text-foreground/60">
          © {new Date().getFullYear()} X-Ample Development. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

