import type { ReactNode } from "react";
import { MotionInView } from "@/components/ui/MotionInView";

type SectionProps = {
  kicker?: string;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  animate?: boolean;
};

export function Section({
  kicker,
  title,
  description,
  children,
  className = "",
  animate = true,
}: SectionProps) {
  const header = (kicker || title || description) && (
    <div className="mb-8 max-w-2xl">
      {kicker ? (
        <p className="text-sm font-medium uppercase tracking-wider text-accent">{kicker}</p>
      ) : null}
      {title ? (
        <h2 className={`text-pretty text-2xl font-semibold tracking-tight sm:text-3xl ${kicker ? "mt-2" : ""}`}>
          {title}
        </h2>
      ) : null}
      {description ? (
        <p className="mt-3 text-base leading-7 text-muted">{description}</p>
      ) : null}
    </div>
  );

  const content = (
    <section className={className}>
      {header}
      {children}
    </section>
  );

  if (animate) {
    return <MotionInView>{content}</MotionInView>;
  }

  return content;
}
