import type { Metadata } from "next";
import path from "node:path";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { readJsonFile } from "@/lib/content";

const aboutDescription =
  "X-Ample Development Studios: who we are, what we build (Discord bots, websites, web apps), and how we work. Quality, performance, and support.";

export const metadata: Metadata = {
  title: "About",
  description: aboutDescription,
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About · X-Ample Development",
    description: aboutDescription,
    type: "website",
    url: "/about",
  },
  twitter: {
    card: "summary_large_image",
    title: "About · X-Ample Development",
    description: aboutDescription,
  },
};

type AboutContent = {
  title: string;
  subtitle: string;
  body: string;
  highlights: Array<{ title: string; body: string }>;
};

const fallback: AboutContent = {
  title: "About X-Ample Development",
  subtitle:
    "We build Discord bots, websites, and web apps with clean UX, performance-first code, and support you can rely on.",
  body: "X-Ample Development (also known as X-Ample Studios) is a development studio focused on Discord bots, websites, and custom web applications.\n\nWe focus on readable UI, practical features, and maintainable code that scales with your community or business.",
  highlights: [
    { title: "Quality first", body: "Consistent UI, sensible defaults, and attention to detail." },
    { title: "Performance-minded", body: "Built to run smoothly and scale with your traffic and community size." },
    { title: "Support & iteration", body: "We listen, fix issues quickly, and keep improving." },
  ],
};

export default async function AboutPage() {
  const contentPath = path.join(process.cwd(), "content", "pages", "about.json");
  const content = await readJsonFile<AboutContent>(contentPath, fallback);

  return (
    <div className="space-y-10">
      <PageHeader title={content.title} description={content.subtitle} />

      <div className="mx-auto max-w-3xl space-y-4 text-sm leading-7 text-foreground/80">
        {String(content.body || "")
          .split("\n\n")
          .filter(Boolean)
          .map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {(content.highlights ?? []).map((h) => (
          <Card key={h.title} title={h.title} accent>
            {h.body}
          </Card>
        ))}
      </div>
    </div>
  );
}
