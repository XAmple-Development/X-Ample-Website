import { DISCORD_INVITE_URL, discordGuildId } from "@/lib/site";
import { Button } from "@/components/ui/Button";

export function DiscordWidget() {
  const guildId = discordGuildId();

  return (
    <div className="rounded-2xl border border-accent/30 bg-accent-muted p-5">
      <div className="text-sm font-semibold text-accent">Discord</div>
      <p className="mt-2 text-sm text-muted">
        Quick questions, announcements, and community help. When you join, mention you came from the website so
        we can help faster.
      </p>
      {guildId ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          <iframe
            title="Discord server widget"
            src={`https://discord.com/widget?id=${encodeURIComponent(guildId)}&theme=dark`}
            width="100%"
            height="320"
            allowTransparency
            sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
          />
        </div>
      ) : null}
      <div className={guildId ? "mt-4" : "mt-4"}>
        <Button href={DISCORD_INVITE_URL} variant="secondary" external>
          Join Discord
        </Button>
      </div>
    </div>
  );
}
