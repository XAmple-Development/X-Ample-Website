import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DiscordWidget } from "@/components/site/DiscordWidget";

const supportDescription =
  "Get help with X-Ample Development. Contact us or join Discord for support, enquiries, and community.";

export const metadata: Metadata = {
  title: "Support",
  description: supportDescription,
  alternates: { canonical: "/support" },
  openGraph: {
    title: "Support · X-Ample Development",
    description: supportDescription,
    type: "website",
    url: "/support",
  },
  twitter: {
    card: "summary_large_image",
    title: "Support · X-Ample Development",
    description: supportDescription,
  },
};

export default function SupportPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        kicker="Support"
        title="We're here to help"
        description="Need help or have a question? Use the options below and we'll get you sorted."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Contact us" accent>
          For enquiries, custom work, or anything that needs a direct reply.
          <div className="mt-4">
            <Button href="/contact" variant="primary">
              Contact
            </Button>
          </div>
        </Card>

        <DiscordWidget />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 text-sm text-muted">
        <div className="text-sm font-semibold text-foreground">When you contact us</div>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>Describe your question or project so we can help quickly.</li>
          <li>Share any relevant details (stack, integrations, error logs) if it&apos;s technical.</li>
        </ul>
      </div>
    </div>
  );
}
