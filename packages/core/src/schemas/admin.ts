/**
 * What the console may write. Every one of these is re-parsed on the server
 * (§6.2) — the form is a convenience, this is the check.
 */
import { z } from "zod";
import { GRANT_KINDS } from "../courses";
import { checkbox, optionalText, optionalUrl, slug } from "./fields";

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
  /* Not a price. There is one price and it is the bundle (§1) — this says
     whether the course is outside it, free to anyone who signs in. */
  is_free: checkbox,
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
    options_mn: z
      .array(z.string().trim().min(1, "Хариултаа бөглөнө үү"))
      .min(2, "Хоёроос доошгүй хариулт"),
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
  grant_kind: z.enum(GRANT_KINDS, "VIP эсвэл Бэлэг сонгоно уу"),
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

/**
 * Who to open the school for, found by the address they registered with.
 *
 * An address rather than a picked id, because the team is told "open it for
 * this person" by that person, in an address — and a `select` of every account
 * stops being a control the day the school has four hundred of them. Lowercased
 * here so a capital in a typed address still finds the row.
 */
export const accessLookupSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Зөв имэйл хаяг оруулна уу")),
});

export type AccessLookupInput = z.infer<typeof accessLookupSchema>;

/** «Эрх олголт»'s two buttons: whom, and why — VIP or Бэлэг (20261016000100). */
export const accessGrantSchema = z.object({
  user_id: z.uuid(),
  grant_kind: z.enum(GRANT_KINDS),
});
