import { MotionInView } from "@/components/ui/MotionInView";

type PageHeaderProps = {
  title: string;
  description?: string;
  kicker?: string;
  centered?: boolean;
};

export function PageHeader({ title, description, kicker, centered = false }: PageHeaderProps) {
  return (
    <MotionInView>
      <div
        className={`xa-hero-bg relative rounded-3xl border border-border px-8 py-12 sm:px-12 sm:py-14 ${
          centered ? "text-center" : ""
        }`}
      >
        <div className={`relative z-10 ${centered ? "mx-auto max-w-2xl" : "max-w-3xl"}`}>
          {kicker ? (
            <p className="text-sm font-medium uppercase tracking-wider text-accent">{kicker}</p>
          ) : null}
          <h1
            className={`text-pretty text-4xl font-semibold tracking-tight sm:text-5xl ${
              kicker ? "mt-3" : ""
            }`}
          >
            {title}
          </h1>
          {description ? (
            <p className="mt-4 text-lg leading-8 text-muted">{description}</p>
          ) : null}
        </div>
      </div>
    </MotionInView>
  );
}
