import type { Metadata } from "next";
import path from "node:path";
import Link from "next/link";
import { readJsonFile } from "@/lib/content";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

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

type TeamMember = {
  id: string;
  name: string;
  role: string | null;
  bio: string | null;
  avatar_url: string | null;
  discord_url: string | null;
  github_url: string | null;
  twitter_url: string | null;
  sort_order: number;
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

const fallbackIntro = "Meet the people behind X-Ample.";
const fallbackContent: TeamContent = {
  intro: fallbackIntro,
  members: [],
};

export default async function TeamPage() {
  let intro = fallbackIntro;
  let members: TeamMember[] = [];

  try {
    const sb = supabaseAdmin();
    const [pageRes, membersRes] = await Promise.all([
      sb.from("team_page").select("intro").eq("id", 1).maybeSingle(),
      sb.from("team_members").select("id, name, role, bio, avatar_url, discord_url, github_url, twitter_url, sort_order").order("sort_order", { ascending: true }).order("updated_at", { ascending: false }),
    ]);
    if (pageRes.data?.intro) intro = pageRes.data.intro;
    if (membersRes.data && membersRes.data.length > 0) {
      members = membersRes.data as TeamMember[];
    }
  } catch {
    // Supabase not configured or table missing: use file fallback
  }

  if (members.length === 0) {
    const contentPath = path.join(process.cwd(), "content", "pages", "team.json");
    const fileContent = await readJsonFile<TeamContent>(contentPath, fallbackContent);
    intro = fileContent.intro || fallbackIntro;
    members = (fileContent.members ?? []).map((m, i) => ({
      id: `file-${i}-${m.name}`,
      name: m.name,
      role: m.role ?? null,
      bio: m.bio ?? null,
      avatar_url: m.avatar ?? null,
      discord_url: m.links?.discord ?? null,
      github_url: m.links?.github ?? null,
      twitter_url: m.links?.twitter ?? null,
      sort_order: i,
    }));
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Hero intro */}
      <section className="rounded-3xl border border-black/10 bg-gradient-to-b from-black/[.02] to-transparent px-8 py-12 text-center dark:border-white/10 dark:from-white/[.03] sm:px-12 sm:py-16">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Team</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-foreground/80">{intro}</p>
      </section>

      {/* Members grid */}
      <section className="mt-12 sm:mt-16">
        {members.length === 0 ? (
          <div className="rounded-3xl border border-black/10 bg-background/60 px-8 py-16 text-center dark:border-white/10">
            <p className="text-foreground/70">No team members to show yet.</p>
            <Link href="/contact" className="mt-4 inline-block text-sm font-medium underline underline-offset-4 hover:opacity-80">
              Get in touch
            </Link>
          </div>
        ) : (
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
            {members.map((m) => (
              <li key={m.id}>
                <MemberCard member={m} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function MemberCard({ member }: { member: TeamMember }) {
  const hasLinks = member.discord_url || member.github_url || member.twitter_url;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-black/10 bg-background transition-shadow hover:shadow-lg dark:border-white/10 dark:hover:shadow-black/20">
      <div className="flex flex-col p-8 sm:p-10">
        <div className="flex flex-col items-start sm:flex-row sm:items-center sm:gap-6">
          <div className="shrink-0">
            {member.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={member.avatar_url}
                alt={member.name}
                className="h-24 w-24 rounded-2xl border border-black/10 object-cover ring-2 ring-transparent transition-all group-hover:ring-foreground/10 dark:border-white/10 sm:h-28 sm:w-28"
              />
            ) : (
              <div
                className="flex h-24 w-24 items-center justify-center rounded-2xl border border-black/10 bg-gradient-to-br from-black/5 to-black/10 text-2xl font-semibold text-foreground/40 dark:border-white/10 dark:from-white/5 dark:to-white/10 sm:h-28 sm:w-28"
                aria-hidden
              >
                {member.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="mt-4 min-w-0 sm:mt-0">
            <h2 className="text-xl font-semibold tracking-tight">{member.name}</h2>
            {member.role ? (
              <p className="mt-1 text-sm font-medium text-foreground/70">{member.role}</p>
            ) : null}
          </div>
        </div>

        {member.bio ? (
          <p className="mt-6 text-sm leading-7 text-foreground/80">{member.bio}</p>
        ) : null}

        {hasLinks ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {member.discord_url ? (
              <a
                href={member.discord_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-black/15 px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:border-black/25 hover:bg-black/5 hover:text-foreground dark:border-white/15 dark:hover:border-white/25 dark:hover:bg-white/5"
              >
                <DiscordIcon className="h-4 w-4" />
                Discord
              </a>
            ) : null}
            {member.github_url ? (
              <a
                href={member.github_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-black/15 px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:border-black/25 hover:bg-black/5 hover:text-foreground dark:border-white/15 dark:hover:border-white/25 dark:hover:bg-white/5"
              >
                <GitHubIcon className="h-4 w-4" />
                GitHub
              </a>
            ) : null}
            {member.twitter_url ? (
              <a
                href={member.twitter_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-black/15 px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:border-black/25 hover:bg-black/5 hover:text-foreground dark:border-white/15 dark:hover:border-white/25 dark:hover:bg-white/5"
              >
                <TwitterIcon className="h-4 w-4" />
                X
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C2.504 6.018 2.05 7.765 2.006 9.536a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.974 19.974 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.041-1.77-.49-3.518-1.635-5.139a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
