import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/site";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-paper text-ink hover:bg-white",
  secondary: "border border-line-strong text-paper hover:border-paper/70 hover:bg-paper/[0.06]",
  ghost: "text-paper hover:text-white underline-offset-4 hover:underline px-0",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-[0.9375rem]",
  lg: "h-13 px-7 text-base",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "lg", className?: string) {
  return cn(
    "group/button inline-flex shrink-0 items-center justify-center gap-2.5 rounded-full font-medium tracking-[-0.005em] transition-[background-color,border-color,color,transform] duration-300 ease-out active:scale-[0.98]",
    sizes[size],
    variants[variant],
    className,
  );
}

type ButtonLinkProps = Omit<ComponentProps<"a">, "href"> & {
  href: string;
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

/** Internal links use next/link; mailto:, tel: and external URLs use a plain anchor. */
export function ButtonLink({ href, variant = "primary", size = "lg", className, children, ...rest }: ButtonLinkProps) {
  const classes = buttonClasses(variant, size, className);
  const isExternal = /^(https?:|mailto:|tel:)/.test(href);

  if (isExternal) {
    const opensNewTab = href.startsWith("http");
    return (
      <a
        href={href}
        className={classes}
        {...(opensNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}
