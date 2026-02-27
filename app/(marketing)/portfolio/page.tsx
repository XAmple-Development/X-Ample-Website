const portfolioDescription =
  "A curated view of X-Ample Development work: FiveM scripts, MLOs, and custom development projects.";

export const metadata = {
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

import path from "node:path";
import { readJsonFile } from "@/lib/content";

type PortfolioContent = {
  intro: string;
  items: Array<{ title: string; description: string }>;
};

const fallback: PortfolioContent = {
  intro: "A curated view of shipped work.",
  items: [
    {
      title: "Scripts",
      description: "Modern gameplay systems and utilities.",
    },
    {
      title: "MLOs",
      description: "High-fidelity interiors and environments.",
    },
  ],
};

export default async function PortfolioPage() {
  const contentPath = path.join(
    process.cwd(),
    "content",
    "pages",
    "portfolio.json",
  );
  const content = await readJsonFile<PortfolioContent>(contentPath, fallback);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Portfolio</h1>
      <p className="mt-4 text-lg leading-8 text-foreground/75">
        {content.intro}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {content.items.map((item) => (
          <Card key={item.title} title={item.title}>
            {item.description}
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

