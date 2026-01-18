import Link from "next/link";

export const metadata = {
  title: "Purchase complete",
};

export default function StoreCompletePage() {
  return (
    <div className="mx-auto max-w-xl text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Thank you!</h1>
      <p className="mt-4 text-foreground/75">
        Your checkout is complete. If you purchased an asset, follow the
        instructions provided by Tebex to access your download.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/store"
          className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:opacity-90"
        >
          Back to store
        </Link>
        <Link
          href="/contact"
          className="inline-flex h-11 items-center justify-center rounded-full border border-black/15 px-6 text-sm font-medium transition-colors hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/[.06]"
        >
          Need help?
        </Link>
      </div>
    </div>
  );
}

