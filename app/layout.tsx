import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteShell } from "@/components/SiteShell";
import { Plausible } from "@/components/analytics/Plausible";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "X-Ample Development",
    template: "%s · X-Ample Development",
  },
  description:
    "X-Ample Development Studios builds high-quality FiveM scripts, MLOs, and experiences.",
  metadataBase: process.env.SITE_URL ? new URL(process.env.SITE_URL) : undefined,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Plausible />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
