import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-4 text-foreground/75">
        The page you’re looking for doesn’t exist or has moved.
      </p>
      <div className="mt-8 flex justify-center">
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:opacity-90"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

