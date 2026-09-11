import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  palette,
  strings,
  toLocale,
  type Locale,
  type Palette,
  type Strings,
} from "@jarvis/core";
import { readPreference, writePreference } from "./storage";

/**
 * The one choice a reader makes: language.
 *
 * It defaults the way the web does — Mongolian — and does not follow the
 * device. `Accept-Language` is ignored on the web for a reason (CLAUDE.md §1),
 * and the same reason applies to a phone bought abroad. The key is the web's
 * cookie name on purpose: one product, one preference, whichever screen it was
 * set on.
 *
 * There is no theme here and `userInterfaceStyle` is not consulted, because the
 * design is dark and there is nothing else to be (CLAUDE.md §4). The palette
 * rides along in this value only so that every screen has a single accessor for
 * the things it draws with — it is a constant, and it never changes.
 */
type SettingsValue = {
  locale: Locale;
  palette: Palette;
  t: Strings;
  setLocale: (locale: Locale) => void;
};

const SettingsContext = createContext<SettingsValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    let cancelled = false;
    void readPreference(LOCALE_COOKIE).then((stored) => {
      if (!cancelled) setLocaleState(toLocale(stored));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    void writePreference(LOCALE_COOKIE, next);
  }, []);

  const value = useMemo<SettingsValue>(
    () => ({ locale, palette, t: strings(locale), setLocale }),
    [locale, setLocale],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsValue {
  const value = useContext(SettingsContext);
  if (!value) throw new Error("useSettings must be used inside <SettingsProvider>");
  return value;
}

/** The three things almost every screen needs. */
export function useIntl(): { locale: Locale; t: Strings; palette: Palette } {
  const { locale, t, palette } = useSettings();
  return { locale, t, palette };
}
