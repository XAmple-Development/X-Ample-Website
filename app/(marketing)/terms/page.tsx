import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing use of the X-Ample Development website and services.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        kicker="Legal"
        title="Terms of Service"
        description="Last updated: May 2026. By using this website, you agree to these terms."
      />

      <section className="space-y-4 text-sm leading-7 text-muted">
        <h2 className="text-lg font-semibold text-foreground">Website use</h2>
        <p>
          This website is provided for information about X-Ample Development and to contact us about Discord bot
          and web development services. You agree not to misuse the site, attempt unauthorised access, or submit
          unlawful content via our forms.
        </p>

        <h2 className="text-lg font-semibold text-foreground">Services &amp; projects</h2>
        <p>
          Custom development work is governed by separate agreements, statements of work, or invoices agreed with
          you in writing. Nothing on this website constitutes a binding offer until we confirm scope, pricing, and
          timeline with you directly.
        </p>

        <h2 className="text-lg font-semibold text-foreground">Intellectual property</h2>
        <p>
          Site content, branding, and code we own remain our property unless otherwise agreed in a client contract.
          Portfolio items may reference third-party projects with appropriate attribution.
        </p>

        <h2 className="text-lg font-semibold text-foreground">Disclaimer</h2>
        <p>
          The site is provided &quot;as is&quot;. We aim to keep information accurate but do not guarantee it is
          complete or current. External links (including Discord) are provided for convenience.
        </p>

        <h2 className="text-lg font-semibold text-foreground">Contact</h2>
        <p>
          Questions about these terms? Email{" "}
          <a href="mailto:info@x-ampledevelopment.co.uk" className="text-accent hover:text-accent-hover">
            info@x-ampledevelopment.co.uk
          </a>{" "}
          or use our{" "}
          <Link href="/contact" className="text-accent hover:text-accent-hover">
            contact form
          </Link>
          .
        </p>
      </section>
    </article>
  );
}
