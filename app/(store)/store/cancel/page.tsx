import Link from "next/link";

export const metadata = {
  title: "Checkout cancelled",
};

export default function StoreCancelPage() {
  return (
    <div className="mx-auto max-w-xl text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Checkout cancelled</h1>
      <p className="mt-4 text-foreground/75">
        No worries — you can return to the store and check out whenever you’re
        ready.
      </p>
      <div className="mt-8 flex justify-center">
        <Link
          href="/store"
          className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:opacity-90"
        >
          Back to store
        </Link>
      </div>
    </div>
  );
}

