import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 font-semibold tracking-tight"
      aria-label="X-Ample Development"
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
        XA
      </span>
      <span className="hidden sm:inline">X-Ample Development</span>
    </Link>
  );
}

