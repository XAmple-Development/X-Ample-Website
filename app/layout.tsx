import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteShell } from "@/components/SiteShell";
import { Plausible } from "@/components/analytics/Plausible";
import { DISCORD_INVITE_URL } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://x-ampledevelopment.co.uk";
const defaultDescription =
  "X-Ample Development: Discord bots, websites, and custom web development. Modern stacks, polished UI, and ongoing support.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl.replace(/\/+$/, "")),
  title: {
    default: "X-Ample Development",
    template: "%s · X-Ample Development",
  },
  description: defaultDescription,
  keywords: [
    "Discord bots",
    "web development",
    "custom development",
    "X-Ample Development",
    "Next.js",
    "web apps",
  ],
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "X-Ample Development",
    description: defaultDescription,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "X-Ample Development" }],
  },
  twitter: {
    card: "summary_large_image",
    description: defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "X-Ample Development",
    url: siteUrl,
    sameAs: [DISCORD_INVITE_URL],
  };

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <Plausible />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
