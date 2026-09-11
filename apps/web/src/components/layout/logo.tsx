import { SITE_NAME } from "@jarvis/core";
import { cn } from "@/lib/cn";

/**
 * The mark: a terminal prompt, `>_`.
 *
 * Two strokes in `currentColor`, so it inherits whatever it sits on — the
 * header, the footer, a dark tile — and needs no second copy for the other
 * theme. Decorative wherever it appears, because the wordmark is always beside
 * it, so it carries `aria-hidden` and no title.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("size-6", className)}
    >
      <path
        d="M5.5 8 9 11.5 5.5 15"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12.5 15.5h6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Mark plus wordmark.
 *
 * `Jarvis` is Latin and capitalised in both editions — never transliterated.
 * A wordmark that changes shape under the language switch stops being the one
 * fixed point on the page.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-ink", className)}>
      <span className="grid size-6 place-items-center rounded-md bg-solid text-solid-ink">
        <LogoMark className="size-4" />
      </span>
      <span className="font-display text-[15px] font-semibold tracking-[-0.01em]">{SITE_NAME}</span>
    </span>
  );
}
