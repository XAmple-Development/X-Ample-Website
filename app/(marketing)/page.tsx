import Link from "next/link";
import path from "node:path";
import { HeroMotion } from "@/components/home/HeroMotion";
import { NewsletterSignup } from "@/components/site/NewsletterSignup";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MotionInView } from "@/components/ui/MotionInView";
import { PortfolioCard } from "@/components/ui/PortfolioCard";
import { Section } from "@/components/ui/Section";
import { readJsonFile } from "@/lib/content";
import { getPortfolioContent } from "@/lib/portfolio";
import { calendlyUrl } from "@/lib/site";
import { siteBaseUrl } from "@/lib/seo";
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

const homeDescription =
  "Discord bots, websites, and custom web development from X-Ample Development. Modern stacks, polished UI, and ongoing support.";

export const metadata: Metadata = {
  title: "Home",
  description: homeDescription,
  alternates: { canonical: "/" },
  openGraph: {
    title: "X-Ample Development",
    description: homeDescription,
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "X-Ample Development",
    description: homeDescription,
  },
};

const fallback: HomeContent = {
  kicker: "X-Ample Development · Discord & Web Studio",
  title: "Build communities and products that feel premium from day one.",
  subtitle:
    "We design and ship Discord bots, websites, and web apps — with clean UX, fast performance, and support you can actually reach.",
  primaryCta: { label: "Contact Us", href: "/contact" },
  secondaryCta: { label: "View Services", href: "/services" },
  features: [
    {
      title: "Production-ready",
      body: "Modern UI, sane defaults, and real-world performance for bots and web apps.",
    },
    { title: "Clear communication", body: "We keep you in the loop from scoping through delivery." },
    { title: "Active support", body: "We iterate quickly, listen to feedback, and fix issues fast." },
  ],
  socialProof: {
    headline: "Built for real teams",
    items: [
      { label: "Custom work", value: "Get in touch" },
      { label: "Vacancies", value: "Join the team" },
      { label: "Support", value: "Tickets + Discord" },
    ],
  },
  quickLinks: [
    { label: "Get Support", href: "/support" },
    { label: "View Portfolio", href: "/portfolio" },
    { label: "View Vacancies", href: "/vacancies" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
};

export default async function HomePage() {
  const contentPath = path.join(process.cwd(), "content", "pages", "home.json");
  const [content, portfolio] = await Promise.all([
    readJsonFile<HomeContent>(contentPath, fallback),
    getPortfolioContent(),
  ]);
  const previewItems = portfolio.items.slice(0, 3);
  const bookingUrl = calendlyUrl();

  const baseUrl = siteBaseUrl();
  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "X-Ample Development",
    url: baseUrl,
    description: homeDescription,
    publisher: { "@type": "Organization", name: "X-Ample Development", url: baseUrl },
  };

  return (
    <div className="space-y-16">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
      />

      {/* Hero */}
      <div className="xa-hero-bg relative rounded-3xl border border-border p-8 sm:p-12 lg:p-14">
        <div className="relative z-10 mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <HeroMotion
            kicker={content.kicker}
            title={
              <>
                Build communities and products that feel{" "}
                <span className="xa-gradient-text">premium from day one.</span>
              </>
            }
            subtitle={content.subtitle}
            actions={
              <>
                <Button href={content.primaryCta.href} variant="primary">
                  {content.primaryCta.label}
                </Button>
                <Button href={content.secondaryCta.href} variant="secondary">
                  {content.secondaryCta.label}
                </Button>
              </>
            }
            features={content.features.slice(0, 3).map((f) => (
              <Feature key={f.title} title={f.title} body={f.body} />
            ))}
          />

          <MotionInView delay={0.15} className="space-y-4">
            <div className="rounded-2xl border border-border bg-surface/80 p-5 backdrop-blur-sm">
              <div className="text-sm font-semibold">{content.socialProof?.headline ?? "Built for real teams"}</div>
              <div className="mt-3 grid gap-3">
                {(content.socialProof?.items ?? []).slice(0, 3).map((it) => (
                  <div key={`${it.label}-${it.value}`} className="flex items-baseline justify-between gap-3">
                    <div className="text-xs text-muted">{it.label}</div>
                    <div className="text-sm font-medium">{it.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface/80 p-5 backdrop-blur-sm">
              <div className="text-sm font-semibold">Quick links</div>
              <div className="mt-3 grid gap-2">
                {(content.quickLinks ?? []).slice(0, 6).map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="rounded-xl border border-border px-3 py-2 text-sm transition-colors hover:border-accent/40 hover:bg-accent-muted"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </MotionInView>
        </div>
      </div>

      {/* Service pillars */}
      <Section
        kicker="What we build"
        title="Discord bots and web apps, done properly"
        description="Two core strengths — community tooling and modern web development — backed by the same attention to quality."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <Card
            title="Discord Bots"
            featured
            accent
            tag="Core service"
            href="/services"
            cta="Explore services"
          >
            Custom bots for moderation, automation, ticketing, roles, and community tools. Built to your specs
            and ready to scale with your server.
          </Card>
          <Card
            title="Websites & Web Apps"
            featured
            accent
            tag="Core service"
            href="/services"
            cta="Explore services"
          >
            Marketing sites, dashboards, admin panels, and full-stack web applications. Modern stacks, clear
            design, and maintainable code.
          </Card>
        </div>
      </Section>

      {/* Portfolio preview */}
      <Section kicker="Portfolio" title="Recent work" description={portfolio.intro}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {previewItems.map((item) => (
            <PortfolioCard key={item.id} item={item} />
          ))}
        </div>
        <div className="mt-6">
          <Button href="/portfolio" variant="secondary">
            View full portfolio
          </Button>
        </div>
      </Section>

      {/* Quick paths */}
      <Section title="More ways to connect" animate={false}>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card title="Support that responds" href="/support" cta="Get support">
            Open a ticket or ask quick questions on Discord. We&apos;re here to help.
          </Card>
          <Card title="Join the team" href="/vacancies" cta="View vacancies">
            Check open vacancies and see if there&apos;s a role that fits you.
          </Card>
          <Card title="Stay in the loop" href="/blog" cta="Read blog">
            Updates, project news, and studio notes on the blog.
          </Card>
        </div>
      </Section>

      <NewsletterSignup />

      {/* Final CTA */}
      <MotionInView>
        <div className="relative overflow-hidden rounded-3xl border border-accent/30 bg-gradient-to-br from-accent-muted via-surface to-surface p-8 sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <div className="text-xl font-semibold sm:text-2xl">Ready to work together?</div>
              <div className="mt-2 text-sm text-muted">
                Contact us for custom Discord bots, websites, or general enquiries.
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button href="/contact" variant="primary">
                Contact Us
              </Button>
              {bookingUrl ? (
                <Button href={bookingUrl} variant="secondary" external>
                  Book a call
                </Button>
              ) : (
                <Button href="/support" variant="secondary">
                  Get Support
                </Button>
              )}
            </div>
          </div>
        </div>
      </MotionInView>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface/60 p-5 backdrop-blur-sm">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
    </div>
  );
}
