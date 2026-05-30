/** Public Discord invite URL */
export const DISCORD_INVITE_URL = "https://discord.gg/PfUWNvnT8Y";

/** Optional Calendly (or similar) booking URL */
export function calendlyUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_CALENDLY_URL?.trim();
  return url || null;
}

/** Optional Discord server ID for the embed widget */
export function discordGuildId(): string | null {
  const id = process.env.NEXT_PUBLIC_DISCORD_GUILD_ID?.trim();
  return id || null;
}

export const PROJECT_TYPES = [
  { value: "discord-bot", label: "Discord bot" },
  { value: "website", label: "Website / web app" },
  { value: "other", label: "Other / not sure" },
] as const;

export const BUDGET_BANDS = [
  { value: "under-500", label: "Under £500" },
  { value: "500-1500", label: "£500 – £1,500" },
  { value: "1500-5000", label: "£1,500 – £5,000" },
  { value: "5000-plus", label: "£5,000+" },
  { value: "unsure", label: "Not sure yet" },
] as const;

export const TIMELINES = [
  { value: "asap", label: "ASAP" },
  { value: "1-4-weeks", label: "1–4 weeks" },
  { value: "1-3-months", label: "1–3 months" },
  { value: "flexible", label: "Flexible" },
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number]["value"];
export type BudgetBand = (typeof BUDGET_BANDS)[number]["value"];
export type Timeline = (typeof TIMELINES)[number]["value"];

export function labelForProjectType(value: string): string {
  return PROJECT_TYPES.find((p) => p.value === value)?.label ?? value;
}

export function labelForBudget(value: string): string {
  return BUDGET_BANDS.find((b) => b.value === value)?.label ?? value;
}

export function labelForTimeline(value: string): string {
  return TIMELINES.find((t) => t.value === value)?.label ?? value;
}
