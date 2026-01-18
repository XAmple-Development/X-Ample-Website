import Link from "next/link";

export default function HomePage() {
  return (
    <div className="xa-grid rounded-3xl border border-black/10 bg-background p-8 dark:border-white/10 sm:p-12">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-medium text-foreground/70">
            X-Ample Development · X-Ample Studios
          </p>
          <h1 className="text-pretty text-4xl font-semibold tracking-tight sm:text-5xl">
            Premium FiveM assets that feel polished on day one.
          </h1>
          <p className="text-pretty text-lg leading-8 text-foreground/75">
            We build scripts, MLOs, and experiences designed for performance,
            clarity, and clean UX. Browse the store, read updates, or get in
            touch for custom work.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/store"
            className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:opacity-90"
          >
            Browse Store
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-11 items-center justify-center rounded-full border border-black/15 px-6 text-sm font-medium transition-colors hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/[.06]"
          >
            Contact Us
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Feature
            title="Production-ready"
            body="Modern UI, sane defaults, and real-world performance."
          />
          <Feature
            title="Clear docs"
            body="Easy installation and straightforward configuration."
          />
          <Feature
            title="Active support"
            body="We keep improving what we ship and listen to feedback."
          />
        </div>
      </div>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-background/60 p-5 dark:border-white/10">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-6 text-foreground/75">{body}</p>
    </div>
  );
}

