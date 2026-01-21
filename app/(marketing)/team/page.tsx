import type { Metadata } from "next";
import path from "node:path";
import { readJsonFile } from "@/lib/content";

export const metadata: Metadata = {
  title: "Team",
  description: "Meet the people behind X-Ample Development.",
  openGraph: {
    title: "Team · X-Ample Development",
    description: "Meet the people behind X-Ample Development.",
    type: "website",
    url: "/team",
  },
  twitter: {
    card: "summary",
    title: "Team · X-Ample Development",
    description: "Meet the people behind X-Ample Development.",
  },
};

type TeamContent = {
  intro: string;
  members: Array<{
    name: string;
    role: string;
    bio: string;
    avatar?: string;
    links?: { discord?: string; github?: string; twitter?: string };
  }>;
};

const fallback: TeamContent = {
  intro: "Meet the people behind X-Ample.",
  members: [
    {
      name: "Dan Pilkington",
      role: "Founder & Developer",
      bio: "10+ years of experience in software development, with a keen interest in building tools that help people work smarter, not harder.",
    },
    {
      name: "Timothy",
      role: "Security Analyst",
      bio: "6 Years of experience in cybersecurity, always looking for the next challenge and preventing threats.",
    },
  ],
};

export default async function TeamPage() {
  const contentPath = path.join(process.cwd(), "content", "pages", "team.json");
  const content = await readJsonFile<TeamContent>(contentPath, fallback);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Team</h1>
      <p className="mt-4 text-lg leading-8 text-foreground/75">{content.intro}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {(content.members ?? []).map((m) => (
          <div key={`${m.name}-${m.role}`} className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
            <div className="flex items-start gap-3">
              {m.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="h-12 w-12 rounded-xl border border-black/10 object-cover dark:border-white/10"
                />
              ) : (
                <div className="h-12 w-12 rounded-xl border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5" />
              )}

              <div className="min-w-0">
                <div className="text-sm font-semibold">{m.name}</div>
                <div className="mt-1 text-xs opacity-70">{m.role}</div>
              </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-foreground/75">{m.bio}</p>

            {m.links && (m.links.discord || m.links.github || m.links.twitter) ? (
              <div className="mt-4 flex flex-wrap gap-3 text-xs">
                {m.links.discord ? (
                  <a className="underline opacity-80 hover:opacity-100" href={m.links.discord} target="_blank" rel="noreferrer">
                    Discord
                  </a>
                ) : null}
                {m.links.github ? (
                  <a className="underline opacity-80 hover:opacity-100" href={m.links.github} target="_blank" rel="noreferrer">
                    GitHub
                  </a>
                ) : null}
                {m.links.twitter ? (
                  <a className="underline opacity-80 hover:opacity-100" href={m.links.twitter} target="_blank" rel="noreferrer">
                    Twitter/X
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

