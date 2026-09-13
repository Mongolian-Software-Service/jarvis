import Image from "next/image";
import starkLogo from "@/assets/stark-logo.png";
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
 * TsStark's own mark, for the credit at the foot of the page and the badge on
 * the about page — the company behind the school, not the school.
 *
 * The artwork is the company's real logo, taken from the file `tsstark.com`
 * serves — black ink on **white paper**, which is what it is drawn for. On a
 * #08090a ground that white sheet is a pale square around the mark, so the copy
 * here has had the paper removed: alpha follows the ink and every surviving
 * pixel is white. `filter: invert()` was tried first and is wrong — it turns the
 * white sheet black rather than transparent, and a not-quite-black square on a
 * near-black ground is more visible than the logo inside it.
 *
 * The site has one theme and it is dark (CLAUDE.md §4), so one white copy is
 * the whole set. Replacing the logo means running the same treatment again.
 *
 * `sizes` is small and fixed because it is: 14–16px beside 12px text, from a
 * 264px source.
 */
export function CompanyMark({ className }: { className?: string }) {
  return (
    <Image
      src={starkLogo}
      alt=""
      aria-hidden="true"
      sizes="32px"
      className={cn("size-4 shrink-0", className)}
    />
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-ink", className)}>
      {/*
       * A purple tile with a dark glyph — the favicon's treatment, so the tab
       * and the bar under it are the same mark rather than two versions of one.
       * The colour is `--accent` and the favicon was moved onto it: purple is
       * the accent (CLAUDE.md §4) and the tile had drifted to its own hex.
       *
       * Dark on the accent scores 5.97:1; white would be 3.34 and fail.
       */}
      <span className="grid size-6 place-items-center rounded-md bg-accent text-solid-ink">
        <LogoMark className="size-4" />
      </span>
      <span className="font-display text-[15px] font-semibold tracking-[-0.01em]">{SITE_NAME}</span>
    </span>
  );
}
