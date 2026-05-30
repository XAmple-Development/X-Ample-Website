import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How X-Ample Development collects, uses, and protects your information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        kicker="Legal"
        title="Privacy Policy"
        description="Last updated: May 2026. This policy explains what we collect when you use our website and how we use it."
      />

      <section className="space-y-4 text-sm leading-7 text-muted">
        <h2 className="text-lg font-semibold text-foreground">Who we are</h2>
        <p>
          X-Ample Development (&quot;we&quot;, &quot;us&quot;) operates{" "}
          <Link href="/" className="text-accent hover:text-accent-hover">
            x-ampledevelopment.co.uk
          </Link>
          . For privacy enquiries, contact{" "}
          <a href="mailto:info@x-ampledevelopment.co.uk" className="text-accent hover:text-accent-hover">
            info@x-ampledevelopment.co.uk
          </a>
          .
        </p>

        <h2 className="text-lg font-semibold text-foreground">What we collect</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-foreground">Contact form:</strong> name, email, optional project details, and
            your message.
          </li>
          <li>
            <strong className="text-foreground">Newsletter:</strong> email address when you subscribe to studio
            updates.
          </li>
          <li>
            <strong className="text-foreground">Analytics:</strong> if enabled, anonymised usage data via Plausible
            Analytics (no cross-site tracking cookies by default).
          </li>
        </ul>

        <h2 className="text-lg font-semibold text-foreground">How we use it</h2>
        <p>
          We use your information to respond to enquiries, send newsletter updates you requested, improve the site,
          and operate our services. We do not sell your personal data.
        </p>

        <h2 className="text-lg font-semibold text-foreground">Retention</h2>
        <p>
          Contact messages are kept as long as needed to handle your enquiry. Newsletter emails are stored until you
          unsubscribe or ask us to remove them.
        </p>

        <h2 className="text-lg font-semibold text-foreground">Third parties</h2>
        <p>
          We use service providers such as Resend (email delivery) and Supabase (data storage) to run the site. They
          process data on our behalf under their own privacy terms.
        </p>

        <h2 className="text-lg font-semibold text-foreground">Your rights</h2>
        <p>
          You may request access, correction, or deletion of your personal data by emailing{" "}
          <a href="mailto:info@x-ampledevelopment.co.uk" className="text-accent hover:text-accent-hover">
            info@x-ampledevelopment.co.uk
          </a>
          .
        </p>
      </section>
    </article>
  );
}
