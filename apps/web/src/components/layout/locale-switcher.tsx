"use client";

import { usePathname, useRouter } from "next/navigation";
import { LOCALES, isLocale, type Locale } from "@jarvis/core";
import { rememberLocale } from "@/lib/locale-cookie";
import { cn } from "@/lib/cn";

/** How each language names itself, shortened for a header that is already busy. */
const SHORT: Record<Locale, string> = { mn: "МН", en: "EN" };

/**
 * Two buttons, not a dropdown: there are two languages, and a menu that holds
 * one alternative costs a tap to tell you so.
 *
 * "МН" is Cyrillic and sits inside the English edition, so this control can
 * never take a Latin-only face — it uses the body font in both editions.
 */
export function LocaleSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(next: Locale) {
    if (next === locale) return;
    // The cookie is what the proxy reads on the next visit to a bare URL.
    rememberLocale(next);

    const segments = pathname.split("/");
    if (isLocale(segments[1])) segments[1] = next;
    else segments.splice(1, 0, next);
    router.push(segments.join("/") || `/${next}`);
    // The page is server-rendered in the old language until this lands.
    router.refresh();
  }

  return (
    <div
      className="flex items-center rounded-full border border-line p-0.5"
      role="group"
      aria-label={label}
    >
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => switchTo(code)}
          aria-current={code === locale ? "true" : undefined}
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors touch-manipulation",
            code === locale ? "bg-panel-3 text-ink" : "text-ink-3 hover:text-ink-2",
          )}
        >
          {SHORT[code]}
        </button>
      ))}
    </div>
  );
}
