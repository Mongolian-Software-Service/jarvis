import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, type Locale } from "@jarvis/core";

/**
 * Remember the chosen language in the browser.
 *
 * A plain module function rather than a line inside the switcher: writing to
 * `document.cookie` is a mutation of something outside React, and the compiler
 * is right to refuse it in a component body. Here it is what it actually is —
 * a call into the platform.
 */
export function rememberLocale(locale: Locale): void {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${LOCALE_COOKIE_MAX_AGE};samesite=lax`;
}
