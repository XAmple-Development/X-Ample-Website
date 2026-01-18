import Link from "next/link";
import path from "node:path";
import { readJsonFile } from "@/lib/content";

type HomeContent = {
  kicker: string;
  title: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  features: Array<{ title: string; body: string }>;
};

const fallback: HomeContent = {
  kicker: "X-Ample Development · Studios",
  title: "Premium FiveM assets that feel polished on day one.",
  subtitle:
    "We build scripts, MLOs, and experiences designed for performance, clarity, and clean UX. Browse the store, read updates, or get in touch for custom work.",
  primaryCta: { label: "Browse Store", href: "/store" },
  secondaryCta: { label: "Contact Us", href: "/contact" },
  features: [
    {
      title: "Production-ready",
      body: "Modern UI, sane defaults, and real-world performance.",
    },
    { title: "Clear docs", body: "Easy installation and configuration." },
    { title: "Active support", body: "We iterate quickly and listen." },
  ],
};

export default async function HomePage() {
  const contentPath = path.join(process.cwd(), "content", "pages", "home.json");
  const content = await readJsonFile<HomeContent>(contentPath, fallback);

  return (
    <div className="xa-grid rounded-3xl border border-black/10 bg-background p-8 dark:border-white/10 sm:p-12">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-medium text-foreground/70">
            {content.kicker}
          </p>
          <h1 className="text-pretty text-4xl font-semibold tracking-tight sm:text-5xl">
            {content.title}
          </h1>
          <p className="text-pretty text-lg leading-8 text-foreground/75">
            {content.subtitle}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={content.primaryCta.href}
            className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:opacity-90"
          >
            {content.primaryCta.label}
          </Link>
          <Link
            href={content.secondaryCta.href}
            className="inline-flex h-11 items-center justify-center rounded-full border border-black/15 px-6 text-sm font-medium transition-colors hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/[.06]"
          >
            {content.secondaryCta.label}
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {content.features.slice(0, 3).map((f) => (
            <Feature key={f.title} title={f.title} body={f.body} />
          ))}
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

