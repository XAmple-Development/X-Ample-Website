import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { siteBaseUrl } from "@/lib/seo";

const servicesDescription =
  "Discord bots, websites, bug fixing, performance tuning, and custom development. UI/UX polish and ongoing support from X-Ample Development.";

export const metadata: Metadata = {
  title: "Services",
  description: servicesDescription,
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Services · X-Ample Development",
    description: servicesDescription,
    type: "website",
    url: "/services",
  },
  twitter: {
    card: "summary_large_image",
    title: "Services · X-Ample Development",
    description: servicesDescription,
  },
};

const featuredServices = [
  {
    title: "Discord bots",
    body: "Custom bots for moderation, automation, ticketing, roles, and community tools. We build and host to your specs — from simple utilities to full server management systems.",
    tag: "Core service",
  },
  {
    title: "Websites & web apps",
    body: "Marketing sites, dashboards, admin panels, and full-stack web applications. Modern stacks (Next.js, React), clear design, and maintainable code.",
    tag: "Core service",
  },
];

const supportingServices = [
  {
    title: "Bug hunting & fixes",
    body: "Strange behaviour, crashes, or logic errors in your bot or web app? We track them down, fix the root cause, and document the change.",
  },
  {
    title: "Performance & optimization",
    body: "Slow page loads, API latency, or unresponsive bots? We profile, identify bottlenecks, and optimize so things run smoothly.",
  },
  {
    title: "UI/UX polish",
    body: "Modern interfaces with consistent patterns, accessibility, and great readability across your products.",
  },
  {
    title: "Custom development",
    body: "From concept to delivery: new features, refactors, integrations, and ongoing support when you need it.",
  },
];

export default function ServicesPage() {
  const baseUrl = siteBaseUrl();
  const servicesJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "X-Ample Development",
    url: `${baseUrl}/services`,
    description: servicesDescription,
    areaServed: "GB",
    serviceType: ["Discord bot development", "Web development", "Custom software development"],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "X-Ample Development services",
      itemListElement: [...featuredServices, ...supportingServices].map((s, i) => ({
        "@type": "Offer",
        position: i + 1,
        itemOffered: {
          "@type": "Service",
          name: s.title,
          description: s.body,
          provider: { "@type": "Organization", name: "X-Ample Development", url: baseUrl },
        },
      })),
    },
  };

  return (
    <div className="space-y-12">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesJsonLd) }}
      />
      <PageHeader
        kicker="Services"
        title="Discord bots, websites, and everything in between"
        description="X-Ample Development builds Discord bots, websites, and custom web solutions. We also fix bugs, tackle performance issues, and polish UI/UX. If you need something bespoke or a problem solved, we can scope it and deliver with clean, maintainable code."
      />

      <Section kicker="Core" title="What we specialise in" animate={false}>
        <div className="grid gap-4 lg:grid-cols-2">
          {featuredServices.map((s) => (
            <Card key={s.title} title={s.title} featured accent tag={s.tag}>
              {s.body}
            </Card>
          ))}
        </div>
      </Section>

      <Section kicker="Also available" title="Supporting services" animate={false}>
        <div className="grid gap-4 sm:grid-cols-2">
          {supportingServices.map((s) => (
            <Card key={s.title} title={s.title} accent>
              {s.body}
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}
