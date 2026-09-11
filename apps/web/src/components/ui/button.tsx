import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "accent" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

/**
 * Controls are pills.
 *
 * `--solid` is a near-white pill on the near-black ground,
 * which is the part of this language people recognise first: the primary action
 * is the highest-contrast thing on the page and carries **no colour at all**.
 * Purple is the accent — links, focus, the current row — and is available here
 * as `accent` for the rare control that has to be one.
 */
const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-solid text-solid-ink hover:bg-solid-hover",
  secondary: "bg-panel-2 text-ink border border-line hover:border-line-strong hover:bg-panel-3",
  ghost: "text-ink-3 hover:text-ink hover:bg-panel-2",
  accent: "bg-accent text-accent-ink hover:bg-accent-hover",
  danger: "bg-bad-soft text-bad border border-bad/25 hover:border-bad/50",
};

/* 32px is the measured height of every control on linear.app; 13px the text. */
const SIZES: Record<ButtonSize, string> = {
  sm: "h-7 px-2.5 text-xs gap-1.5",
  md: "h-8 px-3 text-[13px] gap-1.5",
  lg: "h-10 px-4 text-sm gap-2",
};

/**
 * The class list for a button, so a `<Link>` can wear it without this component
 * becoming polymorphic. One vocabulary, two elements, no `asChild`.
 */
export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
): string {
  return cn(
    "inline-flex items-center justify-center rounded-full font-medium whitespace-nowrap",
    "transition-colors duration-150 select-none",
    "disabled:opacity-50 disabled:pointer-events-none",
    // touch-action on the control only: on the page it would kill pinch-zoom.
    "touch-manipulation pressable",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({ variant = "primary", size = "md", className, ...rest }: Props) {
  return <button className={buttonClass(variant, size, className)} {...rest} />;
}
