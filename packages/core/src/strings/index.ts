import type { Locale } from "../locale";
import { en } from "./en";
import { core } from "./mn/core";
import { marketing } from "./mn/marketing";
import { auth } from "./mn/auth";
import { learn } from "./mn/learn";
import { admin } from "./mn/admin";

/**
 * Every user-facing string, in one place, in each language the product speaks.
 *
 * Composed from several files rather than one table: a single file had nowhere
 * to grow, and the areas — marketing, auth, learning, admin — are edited by
 * different people at different times.
 *
 * **Mongolian is the source of truth for meaning.** `strings/mn/` carries the
 * comments explaining what a key is for; `strings/en/` is a translation table
 * and deliberately carries none, because a comment kept in two places is a
 * comment that disagrees with itself.
 */
export const mn = {
  locale: "mn",
  ...core,
  marketing,
  auth,
  learn,
  admin,
} as const;

/**
 * The shape every locale fills, with Mongolian's *values* widened back to
 * `string`.
 *
 * Without the widening `typeof mn` would say `signIn: "Нэвтрэх"` — a literal —
 * and the English table could not hold "Sign in" without a type error. What
 * remains is the guarantee worth having: a key missing from a translation, or
 * invented in one, does not compile.
 */
type Widen<T> = T extends "mn" | "en"
  ? Locale
  : T extends string
    ? string
    : T extends readonly (infer Item)[]
      ? readonly Widen<Item>[]
      : { [Key in keyof T]: Widen<T[Key]> };

export type Strings = Widen<typeof mn>;

/**
 * This annotation is the whole guarantee: a key added to one language and
 * forgotten in the other stops the build here, rather than showing up as
 * `undefined` on somebody's screen.
 */
const enTable: Strings = en;

export { enTable as en };

/** Fill `{name}` placeholders: `fmt(t.learn.course.progress, { percent: "40" })`. */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = vars[key];
    return value === undefined ? match : String(value);
  });
}

/**
 * The table for one language.
 *
 * Everything user-facing goes through this rather than importing `mn` directly
 * — an import of a single language is a string that cannot be translated, and a
 * few hundred of them are how a product ends up bilingual in theory only.
 */
export function strings(locale: Locale): Strings {
  return locale === "en" ? en : mn;
}
