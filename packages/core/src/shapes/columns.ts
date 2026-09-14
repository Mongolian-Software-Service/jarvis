/**
 * Which columns each read asks for.
 *
 * Their own module because they are a contract with the database, not with a
 * screen: a dropped column should break one import, and every caller that
 * names one of these lists gets the same answer.
 */

// ── The column lists ─────────────────────────────────────────────────────────
//
// `select("*")` is banned (CLAUDE.md §6.1). Naming the columns keeps the
// payload honest and makes a dropped column break here, not three screens away.

export const COURSE_COLUMNS =
  "id, slug, title_mn, title_en, summary_mn, summary_en, level, topic, cover_url, is_free, rank";

export const OUTLINE_COLUMNS =
  "id, course_id, module_id, slug, title_mn, title_en, kind, duration_minutes, is_preview, rank";

export const LESSON_COLUMNS =
  "id, slug, title_mn, title_en, kind, duration_minutes, video_url, body_mn, body_en, code_language, starter_code, solution_code, is_preview";

export const QUIZ_COLUMNS =
  "id, prompt_mn, prompt_en, options_mn, options_en, correct_index, explanation_mn, explanation_en, rank";
