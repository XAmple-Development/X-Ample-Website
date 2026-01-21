import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support",
  description: "Get help with installs, configuration, and store purchases for X-Ample Development packages.",
  openGraph: {
    title: "Support · X-Ample Development",
    description: "Get help with installs, configuration, and store purchases for X-Ample Development packages.",
    url: "/support",
  },
  twitter: {
    card: "summary_large_image",
    title: "Support · X-Ample Development",
    description: "Get help with installs, configuration, and store purchases for X-Ample Development packages.",
  },
};

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-semibold tracking-tight">Support</h1>
      <p className="mt-4 text-lg leading-8 text-foreground/75">
        Need help installing, configuring, or troubleshooting one of our FiveM resources? Use the options below and we’ll
        get you sorted.
      </p>

      <div className="mt-8 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
          <div className="text-sm font-semibold">Docs first</div>
          <p className="mt-2 text-sm text-foreground/75">
            Each package has an install guide, requirements, and common fixes.
          </p>
          <div className="mt-4">
            <Link className="rounded-lg border px-3 py-2 text-sm hover:bg-black/5" href="/docs">
              Browse docs
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
          <div className="text-sm font-semibold">Open a ticket</div>
          <p className="mt-2 text-sm text-foreground/75">
            Best for purchase issues, private help, or anything that needs logs/screenshots.
          </p>
          <div className="mt-4 flex gap-2">
            <Link className="rounded-lg bg-black px-3 py-2 text-sm text-white hover:opacity-90" href="/dashboard/tickets">
              Go to tickets
            </Link>
            <Link className="rounded-lg border px-3 py-2 text-sm hover:bg-black/5" href="/store">
              Login (FiveM)
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
          <div className="text-sm font-semibold">Discord</div>
          <p className="mt-2 text-sm text-foreground/75">
            Quick questions, announcements, and community help.
          </p>
          <div className="mt-4">
            <a
              className="rounded-lg border px-3 py-2 text-sm hover:bg-black/5"
              href="https://discord.gg/PfUWNvnT8Y"
              target="_blank"
              rel="noreferrer"
            >
              Join Discord
            </a>
          </div>
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-black/10 p-5 text-sm text-foreground/75 dark:border-white/10">
        <div className="text-sm font-semibold text-foreground">When you contact us</div>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>Include your package name and Tebex order ID (if applicable).</li>
          <li>Share server console errors + screenshots (redact any secrets).</li>
          <li>Tell us your framework (ESX / QB / standalone) and any key dependencies (ox_lib, qb-menu, etc.).</li>
        </ul>
      </div>
    </div>
  );
}

