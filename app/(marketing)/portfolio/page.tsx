import { PageHeader } from "@/components/ui/PageHeader";
import { PortfolioCard } from "@/components/ui/PortfolioCard";
import { getPortfolioContent } from "@/lib/portfolio";
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

export default async function PortfolioPage() {
  const content = await getPortfolioContent();

  return (
    <div className="space-y-10">
      <PageHeader kicker="Portfolio" title="Our work" description={content.intro} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {content.items.map((item) => (
          <PortfolioCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
