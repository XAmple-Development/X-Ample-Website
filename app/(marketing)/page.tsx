import Link from "next/link";
import path from "node:path";
import { readJsonFile } from "@/lib/content";
import type { Metadata } from "next";

type HomeContent = {
  kicker: string;
  title: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  features: Array<{ title: string; body: string }>;
  socialProof?: {
    headline?: string;
    items?: Array<{ label: string; value: string }>;
  };
  quickLinks?: Array<{ label: string; href: string }>;
};

export const metadata: Metadata = {
  title: "Home",
  description: "Premium FiveM scripts, MLOs, and experiences built for performance, clarity, and clean UX.",
  openGraph: {
    title: "X-Ample Development",
    description: "Premium FiveM scripts, MLOs, and experiences built for performance, clarity, and clean UX.",
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "X-Ample Development",
    description: "Premium FiveM scripts, MLOs, and experiences built for performance, clarity, and clean UX.",
  },
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
  socialProof: {
    headline: "Built for real servers",
    items: [
      { label: "Instant delivery", value: "Tebex checkout" },
      { label: "Documentation", value: "Per-package guides" },
      { label: "Support", value: "Tickets + Discord" },
    ],
  },
  quickLinks: [
    { label: "Browse Store", href: "/store" },
    { label: "Read Docs", href: "/docs" },
    { label: "Get Support", href: "/support" },
    { label: "View Vacancies", href: "/vacancies" },
  ],
};

export default async function HomePage() {
  const contentPath = path.join(process.cwd(), "content", "pages", "home.json");
  const content = await readJsonFile<HomeContent>(contentPath, fallback);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="xa-grid rounded-3xl border border-black/10 bg-background p-8 dark:border-white/10 sm:p-12">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-medium text-foreground/70">{content.kicker}</p>
            <h1 className="text-pretty text-4xl font-semibold tracking-tight sm:text-5xl">{content.title}</h1>
            <p className="text-pretty text-lg leading-8 text-foreground/75">{content.subtitle}</p>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
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

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {content.features.slice(0, 3).map((f) => (
                <Feature key={f.title} title={f.title} body={f.body} />
              ))}
            </div>
          </div>

          {/* Quick links + social proof */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-black/10 bg-background/60 p-5 dark:border-white/10">
              <div className="text-sm font-semibold">{content.socialProof?.headline ?? "Built for real servers"}</div>
              <div className="mt-3 grid gap-3">
                {(content.socialProof?.items ?? []).slice(0, 3).map((it) => (
                  <div key={`${it.label}-${it.value}`} className="flex items-baseline justify-between gap-3">
                    <div className="text-xs opacity-70">{it.label}</div>
                    <div className="text-sm font-medium">{it.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-background/60 p-5 dark:border-white/10">
              <div className="text-sm font-semibold">Quick links</div>
              <div className="mt-3 grid gap-2">
                {(content.quickLinks ?? []).slice(0, 6).map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="rounded-xl border border-black/10 px-3 py-2 text-sm hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured paths */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card
          title="Buy with confidence"
          body="Browse the store, checkout via Tebex, then jump into docs for install and troubleshooting."
          href="/store"
          cta="Browse store"
        />
        <Card
          title="Docs for every package"
          body="Per-package documentation so installs are quick and support is painless."
          href="/docs"
          cta="Read docs"
        />
        <Card
          title="Support that responds"
          body="Open a ticket from your dashboard or ask quick questions on Discord."
          href="/support"
          cta="Get support"
        />
      </div>

      {/* Final CTA */}
      <div className="rounded-3xl border border-black/10 bg-background p-8 dark:border-white/10 sm:p-10">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="text-xl font-semibold">Ready to upgrade your server?</div>
            <div className="mt-1 text-sm text-foreground/75">
              Start with a featured resource, or contact us for custom development.
            </div>
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

function Card({
  title,
  body,
  href,
  cta,
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-2 text-sm text-foreground/75">{body}</div>
      <div className="mt-4">
        <Link className="rounded-lg border px-3 py-2 text-sm hover:bg-black/5" href={href}>
          {cta}
        </Link>
      </div>
    </div>
  );
}

