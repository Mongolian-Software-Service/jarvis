import "server-only";
import type { Metadata } from "next";
import { DEFAULT_LOCALE, LOCALES, SITE_NAME, type Locale } from "@jarvis/core";

const base = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001").replace(/\/$/, "");

/**
 * The reciprocal `hreflang` set for a path that exists in both languages.
 *
 * `path` is written **without** a language prefix — `/courses/react-next` — and
 * the prefix is added per locale here, so a page cannot accidentally point its
 * English alternate at a Mongolian URL.
 *
 * `x-default` is Mongolian, matching what a bare URL resolves to.
 */
export function alternates(path: string): NonNullable<Metadata["alternates"]> {
  const clean = path.startsWith("/") ? path : `/${path}`;
  const languages: Record<string, string> = {};
  for (const code of LOCALES) languages[code] = `${base}/${code}${clean === "/" ? "" : clean}`;
  languages["x-default"] = `${base}/${DEFAULT_LOCALE}${clean === "/" ? "" : clean}`;
  return { languages };
}

/** Title, description and the social tags, in one call. */
export function pageMetadata(input: {
  locale: Locale;
  title: string;
  description: string;
  path: string;
  image?: string | null;
}): Metadata {
  const url = `${base}/${input.locale}${input.path === "/" ? "" : input.path}`;
  return {
    title: input.title,
    description: input.description,
    alternates: alternates(input.path),
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: input.locale === "mn" ? "mn_MN" : "en_US",
      title: input.title,
      description: input.description,
      url,
      ...(input.image ? { images: [{ url: input.image }] } : {}),
    },
    twitter: {
      card: input.image ? "summary_large_image" : "summary",
      title: input.title,
      description: input.description,
      ...(input.image ? { images: [input.image] } : {}),
    },
  };
}
