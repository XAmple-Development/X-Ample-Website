import { ContactForm } from "./ContactForm";
import type { Metadata } from "next";

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
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
      <p className="mt-4 text-lg leading-8 text-foreground/75">
        Have a question, need support, or want custom work? Send a message or
        email us—we’ll get back to you.
      </p>

      <div className="mt-8 rounded-2xl border border-black/10 p-5 dark:border-white/10">
        <p className="text-sm font-semibold">Email</p>
        <ul className="mt-3 space-y-2">
          {contactEmails.map(({ label, email }) => (
            <li key={email} className="flex flex-wrap items-baseline gap-2 text-sm">
              <span className="text-foreground/70">{label}:</span>
              <a
                href={`mailto:${email}`}
                className="text-foreground underline decoration-foreground/30 hover:decoration-foreground"
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

