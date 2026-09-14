import type { Locale } from "../locale";
import { core } from "./mn/core";
import { marketing } from "./mn/marketing";
import { auth } from "./mn/auth";
import { learn } from "./mn/learn";
import { admin } from "./mn/admin";
import { guide } from "./mn/guide";

/**
 * Every user-facing string, in one place.
 *
 * Composed from several files rather than one table: a single file had nowhere
 * to grow, and the areas — marketing, auth, learning, admin — are edited by
 * different people at different times.
 */
export const mn = {
  locale: "mn",
  ...core,
  marketing,
  auth,
  learn,
  admin,
  guide,
} as const;

/**
 * The shape a language fills, with Mongolian's *values* widened back to
 * `string`.
 *
 * Without the widening `typeof mn` would say `signIn: "Нэвтрэх"` — a literal —
 * and a second table could not hold anything else without a type error. The
 * widening is what keeps `Strings` a shape rather than a snapshot.
 */
type Widen<T> = T extends "mn"
  ? Locale
  : T extends string
    ? string
    : T extends readonly (infer Item)[]
      ? readonly Widen<Item>[]
      : { [Key in keyof T]: Widen<T[Key]> };

export type Strings = Widen<typeof mn>;

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
 * There is one, and this still takes the locale: every call site already passes
 * it, and the day a second language arrives this is the only place that has to
 * learn to choose.
 */
export function strings(_locale: Locale): Strings {
  return mn;
}
