export const metadata = {
  title: "About",
};

import path from "node:path";
import { readJsonFile } from "@/lib/content";

type AboutContent = {
  title: string;
  subtitle: string;
  body: string;
  highlights: Array<{ title: string; body: string }>;
};

const fallback: AboutContent = {
  title: "About X-Ample Development",
  subtitle:
    "We build premium FiveM assets with clean UX, performance-first code, and support you can rely on.",
  body: "X-Ample Development (also known as X-Ample Studios) creates modern FiveM scripts, MLOs, and gameplay experiences.\n\nWe focus on readable UI, practical features, and maintainable code that’s easy to run on real servers.",
  highlights: [
    { title: "Quality first", body: "Consistent UI, sensible defaults, and attention to detail." },
    { title: "Performance-minded", body: "Built to run smoothly and scale with your player base." },
    { title: "Support & iteration", body: "We listen, fix issues quickly, and keep improving." },
  ],
};

export default async function AboutPage() {
  const contentPath = path.join(process.cwd(), "content", "pages", "about.json");
  const content = await readJsonFile<AboutContent>(contentPath, fallback);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">{content.title}</h1>
      <p className="mt-4 text-lg leading-8 text-foreground/75">{content.subtitle}</p>

      <div className="mt-6 space-y-4 text-sm leading-7 text-foreground/80">
        {String(content.body || "")
          .split("\n\n")
          .filter(Boolean)
          .map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {(content.highlights ?? []).map((h) => (
          <Card key={h.title} title={h.title}>
            {h.body}
          </Card>
        ))}
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-6 text-foreground/75">{children}</p>
    </div>
  );
}

