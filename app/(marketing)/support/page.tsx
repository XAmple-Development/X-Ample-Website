import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support",
  description: "Get help with X-Ample Development. Contact us or join Discord for support and enquiries.",
  openGraph: {
    title: "Support · X-Ample Development",
    description: "Get help with X-Ample Development. Contact us or join our Discord for support and enquiries.",
    url: "/support",
  },
  twitter: {
    card: "summary_large_image",
    title: "Support · X-Ample Development",
    description: "Get help with X-Ample Development. Contact us or join Discord for support and enquiries.",
  },
};

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-semibold tracking-tight">Support</h1>
      <p className="mt-4 text-lg leading-8 text-foreground/75">
        Need help or have a question? Use the options below and we’ll get you sorted.
      </p>

      <div className="mt-8 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
          <div className="text-sm font-semibold">Contact us</div>
          <p className="mt-2 text-sm text-foreground/75">
            For enquiries, custom work, or anything that needs a direct reply.
          </p>
          <div className="mt-4">
            <Link className="rounded-lg bg-black px-3 py-2 text-sm text-white hover:opacity-90" href="/contact">
              Contact
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
          <li>Describe your question or project so we can help quickly.</li>
          <li>Share any relevant details (e.g. framework, dependencies) if it’s technical.</li>
        </ul>
      </div>
    </div>
  );
}

