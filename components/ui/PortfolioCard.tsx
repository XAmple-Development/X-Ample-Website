import Image from "next/image";
import type { PortfolioItem } from "@/lib/portfolio";

export function PortfolioCard({ item }: { item: PortfolioItem }) {
  const body = (
    <>
      {item.image_url ? (
        <div className="relative mb-4 aspect-video overflow-hidden rounded-xl border border-border bg-surface-elevated">
          <Image
            src={item.image_url}
            alt=""
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ) : null}
      {item.category ? (
        <span className="mb-3 inline-block rounded-full border border-accent/30 bg-accent-muted px-2.5 py-0.5 text-xs font-medium text-accent">
          {item.category}
        </span>
      ) : null}
      <p className="text-base font-semibold">{item.title}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
      {item.project_url ? (
        <p className="mt-4">
          <span className="text-sm font-medium text-accent">View project →</span>
        </p>
      ) : null}
    </>
  );

  const className =
    "block rounded-3xl border border-border bg-surface-elevated p-6 transition-all duration-200 hover:border-accent/30 hover:shadow-[0_0_32px_var(--accent-glow)]";

  if (item.project_url) {
    return (
      <a href={item.project_url} target="_blank" rel="noreferrer" className={className}>
        {body}
      </a>
    );
  }

  return <div className={className}>{body}</div>;
}
