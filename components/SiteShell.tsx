import type { ReactNode } from "react";
import { Footer } from "@/components/site/Footer";
import { Navbar } from "@/components/site/Navbar";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}

