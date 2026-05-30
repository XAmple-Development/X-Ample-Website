import path from "node:path";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { readJsonFile } from "@/lib/content";
import type { Metadata } from "next";

const portfolioDescription =
  "A curated view of X-Ample Development work: Discord bots, websites, and custom web projects.";

export const metadata: Metadata = {
  title: "Portfolio",
  description: portfolioDescription,
  alternates: { canonical: "/portfolio" },
  openGraph: {
    title: "Portfolio · X-Ample Development",
    description: portfolioDescription,
    type: "website",
    url: "/portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio · X-Ample Development",
    description: portfolioDescription,
  },
};

type PortfolioContent = {
  intro: string;
  items: Array<{ title: string; description: string; category?: string }>;
};

const fallback: PortfolioContent = {
  intro: "A curated view of Discord bots, websites, and web apps we've shipped.",
  items: [
    {
      title: "Community Discord Bot",
      description: "Custom moderation and ticketing for a growing community.",
      category: "Discord",
    },
    {
      title: "Marketing Website",
      description: "Fast, modern site with CMS and contact flows.",
      category: "Web",
    },
    {
      title: "Admin Dashboard",
      description: "Internal tooling and dashboards for team workflows.",
      category: "Web",
    },
  ],
};

export default async function PortfolioPage() {
  const contentPath = path.join(process.cwd(), "content", "pages", "portfolio.json");
  const content = await readJsonFile<PortfolioContent>(contentPath, fallback);

  return (
    <div className="space-y-10">
      <PageHeader kicker="Portfolio" title="Our work" description={content.intro} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {content.items.map((item) => (
          <Card key={item.title} title={item.title} tag={item.category} accent featured>
            {item.description}
          </Card>
        ))}
      </div>
    </div>
  );
}
