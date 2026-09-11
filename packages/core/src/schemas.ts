import { z } from "zod";
import { SLUG_PATTERN } from "./slug";

/**
 * Every shape that crosses a trust boundary.
 *
 * Server actions parse with these **before** doing anything else, and the phone
 * will validate the same forms with the same schemas — which is the reason they
 * live in core rather than next to the route that happens to use them first.
 *
 * Admin-facing messages are written in Mongolian here, like the rest of the
 * admin. The two schemas a *student* meets take the string table instead, so
 * "энэ талбарыг бөглөнө үү" does not appear in the English edition.
 */

/** A form field that is empty means null, not "". */
const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .nullable();

/** An HTML checkbox posts "on" when ticked and nothing at all when not. */
const checkbox = z
  .union([z.literal("on"), z.literal("true"), z.literal("false"), z.literal(""), z.undefined()])
  .transform((value) => value === "on" || value === "true");

const slug = z
  .string()
  .trim()
  .min(2, "Хаяг хэт богино байна")
  .max(80, "Хаяг хэт урт байна")
  .regex(SLUG_PATTERN, "Зөвхөн латин жижиг үсэг, тоо, дундуур зураас (жишээ: react-next)");

const optionalUrl = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .refine((value) => value === null || /^https?:\/\//i.test(value), "http эсвэл https хаяг оруулна уу");

// ── Courses ──────────────────────────────────────────────────────────────────

export const courseSchema = z.object({
  slug,
  title_mn: z.string().trim().min(3, "Гарчиг оруулна уу").max(160, "Гарчиг хэт урт байна"),
  title_en: optionalText,
  summary_mn: z.string().trim().min(10, "Товч тайлбар оруулна уу").max(400, "Товч тайлбар хэт урт"),
  summary_en: optionalText,
  description_mn: optionalText,
  description_en: optionalText,
  level: z.enum(["beginner", "intermediate", "advanced"]),
  topic: z
    .string()
    .trim()
    .min(2, "Сэдэв оруулна уу")
    .max(40)
    .transform((value) => value.toLowerCase()),
  cover_url: optionalUrl,
  price_mnt: z.coerce
    .number()
    .int("Бүхэл тоо байна")
    .min(0, "Сөрөг үнэ байж болохгүй")
    .max(100_000_000, "Үнэ хэтэрхий их байна"),
  is_published: checkbox,
  rank: z.coerce.number().int().min(0).max(9999),
});

export type CourseInput = z.infer<typeof courseSchema>;

// ── Modules ──────────────────────────────────────────────────────────────────

export const moduleSchema = z.object({
  course_id: z.uuid("Сургалт сонгоно уу"),
  title_mn: z.string().trim().min(2, "Модулийн нэр оруулна уу").max(160),
  title_en: optionalText,
  rank: z.coerce.number().int().min(0).max(9999),
});

export type ModuleInput = z.infer<typeof moduleSchema>;

// ── Lessons ──────────────────────────────────────────────────────────────────

export const lessonSchema = z
  .object({
    module_id: z.uuid("Модуль сонгоно уу"),
    slug,
    title_mn: z.string().trim().min(2, "Хичээлийн нэр оруулна уу").max(160),
    title_en: optionalText,
    kind: z.enum(["video", "text", "code", "quiz"]),
    video_url: optionalUrl,
    duration_minutes: z.coerce.number().int().min(0, "Сөрөг байж болохгүй").max(600),
    body_mn: optionalText,
    body_en: optionalText,
    code_language: optionalText,
    starter_code: optionalText,
    solution_code: optionalText,
    is_preview: checkbox,
    rank: z.coerce.number().int().min(0).max(9999),
  })
  // The same three rules the database checks. Caught here so the editor can say
  // which field is wrong instead of surfacing a Postgres constraint name.
  .refine((value) => value.kind !== "video" || value.video_url !== null, {
    message: "Видео хичээлд видеоны хаяг заавал хэрэгтэй",
    path: ["video_url"],
  })
  .refine((value) => value.kind !== "text" || value.body_mn !== null, {
    message: "Уншлагын хичээлд монгол эх бичвэр заавал хэрэгтэй",
    path: ["body_mn"],
  })
  .refine((value) => value.kind !== "code" || value.starter_code !== null, {
    message: "Дасгалын хичээлд эхлэлийн код заавал хэрэгтэй",
    path: ["starter_code"],
  });

export type LessonInput = z.infer<typeof lessonSchema>;

// ── Quiz ─────────────────────────────────────────────────────────────────────

export const quizQuestionSchema = z
  .object({
    lesson_id: z.uuid(),
    prompt_mn: z.string().trim().min(3, "Асуулт оруулна уу").max(400),
    prompt_en: optionalText,
    options_mn: z.array(z.string().trim().min(1, "Хариултаа бөглөнө үү")).min(2, "Хоёроос доошгүй хариулт"),
    correct_index: z.coerce.number().int().min(0),
    explanation_mn: optionalText,
    explanation_en: optionalText,
    rank: z.coerce.number().int().min(0).max(999),
  })
  .refine((value) => value.correct_index < value.options_mn.length, {
    message: "Зөв хариултын дугаар хариултын тооноос хэтэрсэн",
    path: ["correct_index"],
  });

export type QuizQuestionInput = z.infer<typeof quizQuestionSchema>;

// ── Access ───────────────────────────────────────────────────────────────────

export const grantSchema = z.object({
  user_id: z.uuid("Сурагч сонгоно уу"),
  course_id: z.uuid("Сургалт сонгоно уу"),
  expires_at: z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .nullable(),
});

export type GrantInput = z.infer<typeof grantSchema>;

export const roleSchema = z.object({
  user_id: z.uuid(),
  role: z.enum(["student", "admin"]),
});

export const checkoutSchema = z.object({
  course_id: z.uuid(),
});

export const progressSchema = z.object({
  lesson_id: z.uuid(),
  completed: z.boolean(),
  seconds_watched: z.coerce.number().int().min(0).max(86_400).optional(),
  quiz_score: z.coerce.number().int().min(0).max(100).nullable().optional(),
});

export type ProgressInput = z.infer<typeof progressSchema>;

// ── The two forms a student meets ────────────────────────────────────────────
//
// Factories, because these messages are read by somebody who chose English.

export type ValidationCopy = {
  email: string;
  password: string;
  name: string;
};

export function signInSchema(copy: ValidationCopy) {
  return z.object({
    email: z.email(copy.email),
    password: z.string().min(1, copy.password),
  });
}

export function signUpSchema(copy: ValidationCopy) {
  return z.object({
    full_name: z.string().trim().min(2, copy.name).max(80),
    email: z.email(copy.email),
    password: z.string().min(8, copy.password).max(72),
  });
}

export function profileSchema(copy: ValidationCopy) {
  return z.object({
    full_name: z.string().trim().min(2, copy.name).max(80),
    locale: z.enum(["mn", "en"]),
  });
}

/**
 * zod's issues, flattened to `{ field: message }`.
 *
 * Server actions return this straight to the form, which renders one message
 * under the field it belongs to. The first issue per field wins — a field with
 * three complaints is a field the person will fix once and resubmit.
 */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
