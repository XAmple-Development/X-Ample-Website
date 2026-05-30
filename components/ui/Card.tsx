import Link from "next/link";
import type { ReactNode } from "react";

type CardProps = {
  title: string;
  children: ReactNode;
  href?: string;
  cta?: string;
  accent?: boolean;
  featured?: boolean;
  tag?: string;
  className?: string;
};

export function Card({
  title,
  children,
  href,
  cta,
  accent = false,
  featured = false,
  tag,
  className = "",
}: CardProps) {
  const surfaceClass = featured
    ? "rounded-3xl border border-border bg-surface-elevated p-6 sm:p-8"
    : "rounded-2xl border border-border bg-surface p-5";

  const accentClass = accent ? "border-t-2 border-t-accent" : "";

  return (
    <div className={[surfaceClass, accentClass, "transition-all duration-200 hover:border-border-strong", className].filter(Boolean).join(" ")}>
      {tag ? (
        <span className="mb-3 inline-block rounded-full border border-accent/30 bg-accent-muted px-2.5 py-0.5 text-xs font-medium text-accent">
          {tag}
        </span>
      ) : null}
      <p className={featured ? "text-base font-semibold" : "text-sm font-semibold"}>{title}</p>
      <div className={`mt-2 text-sm leading-6 text-muted ${featured ? "text-base leading-7" : ""}`}>
        {children}
      </div>
      {href && cta ? (
        <div className="mt-4">
          <Link
            href={href}
            className="inline-flex rounded-full border border-border-strong px-4 py-2 text-sm font-medium transition-colors hover:border-accent/50 hover:bg-accent-muted"
          >
            {cta}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
