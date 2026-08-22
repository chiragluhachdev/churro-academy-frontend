import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/format";

type Variant = "primary" | "outline" | "cream";
type Size = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-2.5 rounded-full font-medium whitespace-nowrap " +
  "transition-[background-color,color,border-color,transform,box-shadow] duration-300 " +
  "ease-[var(--ease-editorial)] active:translate-y-px";

const variants: Record<Variant, string> = {
  primary: "bg-forest text-cream hover:bg-forest-deep hover:shadow-[0_10px_28px_-14px_rgba(41,75,50,0.85)]",
  outline: "border border-forest/25 text-forest hover:border-forest/60 hover:bg-forest/5",
  cream: "bg-cream text-forest hover:bg-white",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-[0.8rem] sm:px-5 sm:py-2.5 sm:text-sm",
  md: "px-5 py-3 text-[0.82rem] sm:px-7 sm:py-3.5 sm:text-[0.95rem]",
};

interface ButtonProps extends Omit<ComponentProps<typeof Link>, "children"> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

/**
 * Every CTA on the home page points somewhere, so this renders an anchor
 * rather than a <button>. A form-submitting variant lands with the newsletter.
 */
export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <Link
      className={cn(base, variants[variant], sizes[size], "group", className)}
      {...props}
    >
      {children}
    </Link>
  );
}

export { base as buttonBase, variants as buttonVariants, sizes as buttonSizes };
