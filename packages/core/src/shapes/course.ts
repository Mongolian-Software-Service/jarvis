/**
 * A course row becomes a card. One function, because the catalogue, the
 * dashboard, the trail and the phone all draw the same object.
 */
import { localized, localizedOrNull, type Locale } from "../locale";
import type { CourseCard, CourseRow } from "./types";

// ── The mappers ──────────────────────────────────────────────────────────────

export function toCourseCard(
  row: CourseRow,
  locale: Locale,
  totals?: { count: number; minutes: number },
): CourseCard {
  return {
    id: row.id,
    slug: row.slug,
    title: localized(locale, row.title_mn, row.title_en),
    summary: localized(locale, row.summary_mn, row.summary_en),
    level: row.level,
    topic: row.topic,
    coverUrl: row.cover_url,
    isFree: row.is_free,
    lessonCount: totals?.count ?? 0,
    minutes: totals?.minutes ?? 0,
  };
}
