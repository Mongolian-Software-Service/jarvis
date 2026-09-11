import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { locale as rootLocale } from "next/root-params";
import { LOCALE_HEADER, strings, toLocale, type Locale, type Strings } from "@jarvis/core";

/**
 * The language of the current render.
 *
 * `next/root-params` reads the `[locale]` segment above the root layout, so any
 * server component can ask without the page passing it down. It is **not**
 * available in Server Actions or Route Handlers — those use
 * `getRequestLocale()` below, which reads the header the proxy set.
 */
export async function getLocale(): Promise<Locale> {
  return toLocale(await rootLocale());
}

/** The string table for the current render. */
export async function getStrings(): Promise<Strings> {
  return strings(await getLocale());
}

/** Both, for the common case of a component that needs the locale as well. */
export async function getIntl(): Promise<{ locale: Locale; t: Strings }> {
  const locale = await getLocale();
  return { locale, t: strings(locale) };
}

/**
 * The language a Server Action or Route Handler is answering in.
 *
 * Root params are unavailable there, so this reads the `x-locale` header the
 * proxy writes onto every matched request.
 */
export const getRequestLocale = cache(async (): Promise<Locale> => {
  try {
    return toLocale((await headers()).get(LOCALE_HEADER));
  } catch {
    return toLocale(null);
  }
});

export async function getRequestStrings(): Promise<Strings> {
  return strings(await getRequestLocale());
}
