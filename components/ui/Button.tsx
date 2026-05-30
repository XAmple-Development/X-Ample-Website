import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-hover xa-glow hover:shadow-[0_0_32px_var(--accent-glow)]",
  secondary:
    "border border-border-strong bg-surface text-foreground hover:border-accent/50 hover:bg-accent-muted",
  ghost: "text-foreground/80 hover:text-foreground hover:bg-accent-muted",
};

type BaseProps = {
  variant?: Variant;
  className?: string;
  children: ReactNode;
};

type ButtonProps = BaseProps &
  Omit<ComponentProps<"button">, keyof BaseProps> & {
    href?: never;
  };

type LinkButtonProps = BaseProps &
  Omit<ComponentProps<typeof Link>, keyof BaseProps | "href"> & {
    href: string;
    external?: boolean;
  };

const baseClass =
  "inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-medium transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none";

export function Button(props: ButtonProps | LinkButtonProps) {
  const { variant = "primary", className = "", children } = props;
  const classes = [baseClass, variants[variant], className].filter(Boolean).join(" ");

  if ("href" in props && props.href) {
    const { href, external, ...rest } = props as LinkButtonProps;
    if (external || /^https?:\/\//i.test(href)) {
      return (
        <a href={href} className={classes} target="_blank" rel="noreferrer">
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } = props as ButtonProps;
  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
