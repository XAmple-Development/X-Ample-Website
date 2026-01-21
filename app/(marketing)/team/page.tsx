export const metadata = {
  title: "Team",
};

import path from "node:path";
import { readJsonFile } from "@/lib/content";

type TeamContent = {
  intro: string;
  members: Array<{ name: string; role: string; bio: string }>;
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
            <div className="text-sm font-semibold">{m.name}</div>
            <div className="mt-1 text-xs opacity-70">{m.role}</div>
            <p className="mt-3 text-sm leading-6 text-foreground/75">{m.bio}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

