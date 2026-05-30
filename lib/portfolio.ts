import path from "node:path";
import { readJsonFile } from "@/lib/content";
import { supabaseAdmin } from "@/lib/supabase";

export type PortfolioItem = {
  id: string;
  title: string;
  description: string;
  category: string | null;
  image_url: string | null;
  project_url: string | null;
  sort_order: number;
};

export type PortfolioContent = {
  intro: string;
  items: PortfolioItem[];
};

const fallback: PortfolioContent = {
  intro: "A curated view of Discord bots, websites, and web apps we've shipped.",
  items: [
    {
      id: "fallback-1",
      title: "Community Discord Bot",
      description: "Custom moderation and ticketing for a growing community.",
      category: "Discord",
      image_url: null,
      project_url: null,
      sort_order: 0,
    },
    {
      id: "fallback-2",
      title: "Marketing Website",
      description: "Fast, modern site with CMS and contact flows.",
      category: "Web",
      image_url: null,
      project_url: null,
      sort_order: 1,
    },
    {
      id: "fallback-3",
      title: "Admin Dashboard",
      description: "Internal tooling and dashboards for team workflows.",
      category: "Web",
      image_url: null,
      project_url: null,
      sort_order: 2,
    },
  ],
};

type PortfolioJson = {
  intro: string;
  items: Array<{
    title: string;
    description: string;
    category?: string;
    image_url?: string;
    project_url?: string;
  }>;
};

export async function getPortfolioContent(): Promise<PortfolioContent> {
  try {
    const sb = supabaseAdmin();
    const [pageRes, itemsRes] = await Promise.all([
      sb.from("portfolio_page").select("intro").eq("id", 1).maybeSingle(),
      sb
        .from("portfolio_items")
        .select("id, title, description, category, image_url, project_url, sort_order")
        .order("sort_order", { ascending: true })
        .order("updated_at", { ascending: false }),
    ]);

    if (itemsRes.data && itemsRes.data.length > 0) {
      return {
        intro: pageRes.data?.intro ?? fallback.intro,
        items: itemsRes.data as PortfolioItem[],
      };
    }
  } catch {
    // Supabase not configured
  }

  const contentPath = path.join(process.cwd(), "content", "pages", "portfolio.json");
  const file = await readJsonFile<PortfolioJson>(contentPath, {
    intro: fallback.intro,
    items: fallback.items.map(({ title, description, category }) => ({
      title,
      description,
      category: category ?? undefined,
    })),
  });

  return {
    intro: file.intro || fallback.intro,
    items: (file.items ?? []).map((item, i) => ({
      id: `file-${i}-${item.title}`,
      title: item.title,
      description: item.description,
      category: item.category ?? null,
      image_url: item.image_url ?? null,
      project_url: item.project_url ?? null,
      sort_order: i,
    })),
  };
}

export function normalizeSortOrder(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

export function safeTrim(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  return null;
}
