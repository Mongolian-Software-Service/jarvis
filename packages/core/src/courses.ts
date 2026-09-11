import type { Enums } from "@jarvis/types";
import type { Locale } from "./locale";

export type CourseLevel = Enums<"course_level">;
export type LessonKind = Enums<"lesson_kind">;
export type EnrollmentSource = Enums<"enrollment_source">;

export const COURSE_LEVELS: readonly CourseLevel[] = ["beginner", "intermediate", "advanced"];

const LEVEL_LABELS: Record<Locale, Record<CourseLevel, string>> = {
  mn: { beginner: "Анхан шат", intermediate: "Дунд шат", advanced: "Ахисан шат" },
  en: { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" },
};

export function levelLabel(level: CourseLevel, locale: Locale): string {
  return LEVEL_LABELS[locale][level];
}

const KIND_LABELS: Record<Locale, Record<LessonKind, string>> = {
  mn: { video: "Видео", text: "Унших", code: "Код бичих", quiz: "Шалгалт" },
  en: { video: "Video", text: "Reading", code: "Exercise", quiz: "Quiz" },
};

export function kindLabel(kind: LessonKind, locale: Locale): string {
  return KIND_LABELS[locale][kind];
}

const SOURCE_LABELS: Record<Locale, Record<EnrollmentSource, string>> = {
  mn: { purchase: "Худалдан авсан", grant: "Админ нээсэн", free: "Үнэгүй" },
  en: { purchase: "Purchased", grant: "Granted", free: "Free" },
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
    general: "General",
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
export function signInPath(locale: Locale, next?: string): string {
  const base = `/${locale}/sign-in`;
  return next ? `${base}?next=${encodeURIComponent(next)}` : base;
}
export function adminPath(locale: Locale, rest = ""): string {
  return `/${locale}/admin${rest}`;
}
