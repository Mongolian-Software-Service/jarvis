import type { Enums } from "@jarvis/types";
import { LOCALES, type Locale } from "./locale";
import type { Role } from "./roles";

export type CourseLevel = Enums<"course_level">;
export type LessonKind = Enums<"lesson_kind">;
export type EnrollmentSource = Enums<"enrollment_source">;

export const COURSE_LEVELS: readonly CourseLevel[] = ["beginner", "intermediate", "advanced"];

const LEVEL_LABELS: Record<Locale, Record<CourseLevel, string>> = {
  mn: { beginner: "Анхан шат", intermediate: "Дунд шат", advanced: "Ахисан шат" },
};

export function levelLabel(level: CourseLevel, locale: Locale): string {
  return LEVEL_LABELS[locale][level];
}

const KIND_LABELS: Record<Locale, Record<LessonKind, string>> = {
  mn: { video: "Видео", text: "Унших", code: "Код бичих", quiz: "Шалгалт" },
};

export function kindLabel(kind: LessonKind, locale: Locale): string {
  return KIND_LABELS[locale][kind];
}

const SOURCE_LABELS: Record<Locale, Record<EnrollmentSource, string>> = {
  mn: { purchase: "Худалдан авсан", grant: "Админ нээсэн", free: "Үнэгүй" },
};

export function sourceLabel(source: EnrollmentSource, locale: Locale): string {
  return SOURCE_LABELS[locale][source];
}

/**
 * The tint a topic wears, as a token name rather than a colour.
 *
 * `topic` is a free-text tag on purpose (the curriculum grows faster than a
 * migration), so an unknown tag must still get a stable colour instead of
 * falling through to a default that makes every new course look the same.
 * Hashing the tag is what gives a tag nobody has seen yet its own tint, and the
 * same tint every time.
 */
export const TOPIC_TINTS = ["indigo", "teal", "amber", "rose", "violet"] as const;
export type TopicTint = (typeof TOPIC_TINTS)[number];

const KNOWN_TINTS: Record<string, TopicTint> = {
  general: "indigo",
  prompt: "amber",
  mobile: "teal",
  games: "rose",
  web: "teal",
  javascript: "amber",
  typescript: "indigo",
  react: "violet",
  python: "rose",
};

export function topicTint(topic: string): TopicTint {
  const known = KNOWN_TINTS[topic.toLowerCase()];
  if (known) return known;
  let hash = 0;
  for (let i = 0; i < topic.length; i++) hash = (hash * 31 + topic.charCodeAt(i)) >>> 0;
  return TOPIC_TINTS[hash % TOPIC_TINTS.length]!;
}

/** Topics are technology names — the same word in both editions. */
export function topicLabel(topic: string): string {
  const names: Record<string, string> = {
    web: "Web",
    javascript: "JavaScript",
    typescript: "TypeScript",
    react: "React",
    python: "Python",
    mobile: "Mobile",
    games: "Games",
    general: "General",
    prompt: "Prompt",
  };
  return names[topic.toLowerCase()] ?? topic;
}

// ── Paths ────────────────────────────────────────────────────────────────────
// Every internal link is built here, so a route rename is one edit and the
// phone's deep links cannot drift from the web's URLs.

export function homePath(locale: Locale): string {
  return `/${locale}`;
}
export function coursesPath(locale: Locale): string {
  return `/${locale}/courses`;
}
export function coursePath(locale: Locale, slug: string): string {
  return `/${locale}/courses/${slug}`;
}
export function learnPath(locale: Locale): string {
  return `/${locale}/learn`;
}
export function dashboardPath(locale: Locale): string {
  return `/${locale}/dashboard`;
}
export function helloPath(locale: Locale): string {
  return `/${locale}/hello`;
}
export function accountPath(locale: Locale): string {
  return `/${locale}/account`;
}
/** The in-site reader for a course's handbook, not the PDF itself. */
export function handbookPath(locale: Locale, courseSlug: string): string {
  return `/${locale}/courses/${courseSlug}/handbook`;
}
export function coursePlayerPath(locale: Locale, courseSlug: string): string {
  return `/${locale}/learn/${courseSlug}`;
}
export function lessonPath(locale: Locale, courseSlug: string, lessonSlug: string): string {
  return `/${locale}/learn/${courseSlug}/${lessonSlug}`;
}
export function aboutPath(locale: Locale): string {
  return `/${locale}/about`;
}
export function contactPath(locale: Locale): string {
  return `/${locale}/contact`;
}
export function signUpPath(locale: Locale): string {
  return `/${locale}/sign-up`;
}
export function signInPath(locale: Locale, next?: string): string {
  const base = `/${locale}/sign-in`;
  return next ? `${base}?next=${encodeURIComponent(next)}` : base;
}
export function adminPath(locale: Locale, rest = ""): string {
  return `/${locale}/admin${rest}`;
}

/**
 * Where somebody lands the moment they finish signing in.
 *
 * A student goes to their own lessons, not to the marketing page they just came
 * through — they signed in to study. The team goes to the console, because that
 * is the only reason they sign in at all.
 *
 * Only used when nothing more specific was asked for: somebody who clicked
 * "sign in to buy this course" is sent back to that course instead.
 */
export function landingPath(locale: Locale, role: Role | null | undefined): string {
  return role === "admin" ? adminPath(locale) : dashboardPath(locale);
}

/**
 * Where a new session actually goes — the one rule, in one place.
 *
 * Three doors end here (the password form, the sign-up form and
 * `/auth/confirm`, which catches Google and every email link), and each used to
 * decide for itself what to do with `?next=`. Two things have to be true at all
 * three, so they are true here instead:
 *
 *   1. **Only a path on this site.** An absolute URL would make every sign-in
 *      link an open redirect somebody could aim anywhere.
 *   2. **Never the marketing page.** Signing in from the front page sets
 *      `next` to the front page, and honouring it lands somebody who just
 *      signed in back on the pitch for the thing they signed in to use. `/mn`
 *      would bounce them onward — it redirects a signed-in visitor — but a
 *      redirect that fixes a destination we chose wrongly is not a rule, it is
 *      a net. So the front page is read as "nowhere in particular was asked
 *      for", and the role decides.
 */
export function destinationAfterSignIn(
  locale: Locale,
  role: Role | null | undefined,
  asked?: string | null,
): string {
  const path = asked && asked.startsWith("/") && !asked.startsWith("//") ? asked : null;
  const isMarketing = path === "/" || LOCALES.some((code) => path === `/${code}`);
  return !path || isMarketing ? landingPath(locale, role) : path;
}
