import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { locale as rootLocale } from "next/root-params";
import { LOCALES, SITE_NAME, SITE_TAGLINE, THEME_COLOR, toLocale } from "@jarvis/core";
import "../globals.css";

/**
 * This is the root layout — there is no `app/layout.tsx`.
 *
 * `<html lang>` depends on the locale, and `next/root-params` only exposes the
 * segments that sit *above* the root layout. Putting the root layout here is
 * what lets any server component ask for the current language without every
 * page passing it down. Do not add a passthrough layout above this one.
 */

/**
 * One typeface for the interface, and it has to carry `cyrillic-ext`.
 *
 * Google's `cyrillic` subset covers U+0400–045F. Mongolian's two distinctive
 * vowels sit outside it:
 *
 *   Ө / ө = U+04E8 / U+04E9      Ү / ү = U+04AE / U+04AF
 *
 * Both are in `cyrillic-ext` (U+0460–052F). Ship `cyrillic` alone and every Ө
 * and Ү on the site falls back to a system font mid-word, at a different weight
 * and width — өнөөдөр, үзэх, төрийн, үндэсний all hit it constantly. It looks
 * like a rendering bug because it is one.
 *
 * Inter rather than a display face beside a body face: the design is Linear's,
 * and a second family is the first thing that would break the resemblance. Its
 * Cyrillic was drawn alongside its Latin, which is not true of most grotesques
 * that carry the subset at all.
 */
const inter = Inter({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

/**
 * One `theme-color`, static — not a `prefers-color-scheme` pair.
 *
 * There is one theme (CLAUDE.md §4), so the phone's address bar has one colour
 * and it is `--bg`. A pair would tint the chrome from the *device* setting
 * while the page below renders dark regardless, which is how you get a white
 * bar above a black page.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  /* What makes env(safe-area-inset-*) return anything but 0px. */
  viewportFit: "cover",
  themeColor: THEME_COLOR,
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = toLocale(await rootLocale());
  return {
    title: {
      default: `${SITE_NAME} — ${SITE_TAGLINE[locale]}`,
      template: `%s · ${SITE_NAME}`,
    },
    description: SITE_TAGLINE[locale],
    applicationName: SITE_NAME,
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001"),
  };
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

/**
 * Nothing here decides a theme — the stylesheet has only one, and `:root` sets
 * `color-scheme: dark` with it. So there is no attribute on `<html>`, no cookie
 * to read, no bootstrap script and nothing to hydrate: the first paint is the
 * right colour because it is the only colour.
 */
export default async function RootLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;

  return (
    <html lang={toLocale(locale)} className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="bg-bg text-ink min-h-dvh antialiased">
        {children}
        {/*
         * How many people visit — Vercel Web Analytics, read in the Vercel
         * dashboard (Analytics) and linked from the console's overview. No
         * cookie and nothing that names a visitor, which is what keeps the
         * privacy policy's «хөндлөнгийн хяналтын күүки байхгүй» true; the
         * policy says so in its own section. Served from our own domain
         * (`/_vercel/insights`), so there is no third-party request either.
         * In `next dev` it sends nothing.
         */}
        <Analytics />
      </body>
    </html>
  );
}
