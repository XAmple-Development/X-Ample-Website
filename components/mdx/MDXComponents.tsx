import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";

export const mdxComponents = {
  h1: (props: ComponentProps<"h1">) => (
    <h1
      {...props}
      className={[
        "text-pretty text-3xl font-semibold tracking-tight sm:text-4xl",
        props.className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  ),
  h2: (props: ComponentProps<"h2">) => (
    <h2
      {...props}
      className={[
        "mt-10 text-pretty text-2xl font-semibold tracking-tight",
        props.className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  ),
  h3: (props: ComponentProps<"h3">) => (
    <h3
      {...props}
      className={[
        "mt-8 text-pretty text-xl font-semibold tracking-tight",
        props.className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  ),
  p: (props: ComponentProps<"p">) => (
    <p
      {...props}
      className={["mt-4 leading-7 text-foreground/80", props.className]
        .filter(Boolean)
        .join(" ")}
    />
  ),
  a: (props: ComponentProps<"a">) => {
    const href = props.href ?? "#";
    const isExternal = /^https?:\/\//i.test(href);

    const className = [
      "font-medium underline underline-offset-4 decoration-black/30 hover:decoration-black/60 dark:decoration-white/30 dark:hover:decoration-white/60",
      props.className,
    ]
      .filter(Boolean)
      .join(" ");

    if (!isExternal && href.startsWith("/")) {
      return (
        <Link href={href} className={className}>
          {props.children}
        </Link>
      );
    }

    return (
      <a {...props} className={className} target="_blank" rel="noreferrer">
        {props.children}
      </a>
    );
  },
  ul: (props: ComponentProps<"ul">) => (
    <ul {...props} className={["mt-4 list-disc pl-6", props.className].filter(Boolean).join(" ")} />
  ),
  ol: (props: ComponentProps<"ol">) => (
    <ol {...props} className={["mt-4 list-decimal pl-6", props.className].filter(Boolean).join(" ")} />
  ),
  li: (props: ComponentProps<"li">) => (
    <li {...props} className={["mt-2 leading-7 text-foreground/80", props.className].filter(Boolean).join(" ")} />
  ),
  code: (props: ComponentProps<"code">) => (
    <code
      {...props}
      className={[
        "rounded-md bg-black/[.06] px-1.5 py-0.5 font-mono text-[0.9em] dark:bg-white/[.10]",
        props.className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  ),
  pre: (props: ComponentProps<"pre">) => (
    <pre
      {...props}
      className={[
        "mt-6 overflow-x-auto rounded-2xl bg-black/[.06] p-4 text-sm leading-6 dark:bg-white/[.10]",
        props.className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  ),
  Blockquote: ({ children }: { children: ReactNode }) => (
    <blockquote className="mt-6 rounded-2xl border border-black/10 bg-black/[.03] p-4 text-sm text-foreground/80 dark:border-white/10 dark:bg-white/[.06]">
      {children}
    </blockquote>
  ),
};

