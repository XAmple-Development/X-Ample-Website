import { ContactForm } from "./ContactForm";
import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";

const contactDescription =
  "Get in touch with X-Ample Development. General enquiries, careers, or custom work. Email or use the contact form.";

export const metadata: Metadata = {
  title: "Contact",
  description: contactDescription,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact · X-Ample Development",
    description: contactDescription,
    type: "website",
    url: "/contact",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact · X-Ample Development",
    description: contactDescription,
  },
};

const contactEmails = [
  { label: "General enquiries", email: "info@x-ampledevelopment.co.uk" },
  { label: "Careers enquiries", email: "careers@x-ampledevelopment.co.uk" },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        kicker="Contact"
        title="Get in touch"
        description="Have a question, need support, or want custom work? Send a message or email us — we'll get back to you."
      />

      <div className="rounded-2xl border border-border bg-surface p-5">
        <p className="text-sm font-semibold">Email</p>
        <ul className="mt-3 space-y-2">
          {contactEmails.map(({ label, email }) => (
            <li key={email} className="flex flex-wrap items-baseline gap-2 text-sm">
              <span className="text-muted">{label}:</span>
              <a
                href={`mailto:${email}`}
                className="text-accent underline decoration-accent/30 hover:text-accent-hover hover:decoration-accent"
              >
                {email}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <ContactForm />
    </div>
  );
}
