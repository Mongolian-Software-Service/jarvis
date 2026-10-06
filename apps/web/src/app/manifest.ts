import type { MetadataRoute } from "next";
import { DEFAULT_LOCALE, SITE_NAME, SITE_TAGLINE, THEME_COLOR } from "@jarvis/core";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — ${SITE_TAGLINE[DEFAULT_LOCALE]}`,
    short_name: SITE_NAME,
    description: SITE_TAGLINE[DEFAULT_LOCALE],
    /*
     * `/mn`, not `/`. The root only redirects to the default language, and a
     * home-screen launch should not spend its first paint on a 307.
     */
    start_url: `/${DEFAULT_LOCALE}`,
    display: "standalone",
    /* Both are `--bg`: an installed app has one theme, like the site. */
    background_color: THEME_COLOR,
    theme_color: THEME_COLOR,
    lang: DEFAULT_LOCALE,
    /*
     * The SVG for anything that scales it, and the 192px PNG beside it for
     * the launchers that will not take an SVG. Both are rendered from the same
     * drawing (`pnpm icons`).
     */
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon1.png", sizes: "192x192", type: "image/png" },
    ],
  };
}
