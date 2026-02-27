import type { Metadata } from "next";

const servicesDescription =
  "FiveM scripts, Discord bots, websites, bug fixing, performance tuning, and custom development. MLOs, UI/UX polish, and ongoing support from X-Ample Development.";

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

const services = [
  {
    title: "FiveM scripts",
    body: "Gameplay systems, UIs, and integrations for ESX, QBCore, and standalone. From small utilities to full frameworks.",
  },
  {
    title: "MLOs & mapping",
    body: "High-quality interiors and environments built for performance and visual consistency.",
  },
  {
    title: "Discord bots",
    body: "Custom bots for moderation, automation, ticketing, roles, and community tools. We build and host to your specs.",
  },
  {
    title: "Websites & web apps",
    body: "Marketing sites, dashboards, and web applications. Modern stacks, clear design, and maintainable code.",
  },
  {
    title: "Bug hunting & fixes",
    body: "Strange behaviour, crashes, or logic errors? We track them down, fix the root cause, and document the change.",
  },
  {
    title: "Performance & optimization",
    body: "Lag, stutter, or high resource usage? We profile, identify bottlenecks, and optimize so things run smoothly.",
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
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-semibold tracking-tight">Services</h1>
      <p className="mt-4 text-lg leading-8 text-foreground/75">
        X-Ample Development builds FiveM assets, Discord bots, websites, and custom solutions.
        We also fix bugs, tackle performance issues, and polish UI/UX. If you need something
        bespoke or a problem solved, we can scope it and deliver with clean, maintainable code.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {services.map((s) => (
          <Card key={s.title} title={s.title}>
            {s.body}
          </Card>
        ))}
      </div>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-6 text-foreground/75">{children}</p>
    </div>
  );
}

