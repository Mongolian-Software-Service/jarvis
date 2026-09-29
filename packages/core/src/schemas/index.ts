import { z } from "zod";

/**
 * Every shape that crosses a trust boundary.
 *
 * Server actions parse with these **before** doing anything else, and the form
 * that submits to an action reads the same schema for its own field rules —
 * which is why they live here rather than next to whichever route used them
 * first. A form and the action behind it disagreeing about what is valid is a
 * message the student cannot act on.
 *
 * Admin-facing messages are written in Mongolian here, like the rest of the
 * admin. The two schemas a *student* meets take the string table instead, so
 * "энэ талбарыг бөглөнө үү" does not appear in the English edition.
 */

/**
 * There is one thing to buy, so there is one shape to buy it with.
 *
 * It still carries a field rather than accepting an empty body: a route whose
 * valid request is `{}` accepts a stray POST from anything on the internet
 * that pokes at it, and `{ bundle: true }` says what the caller meant.
 */
export const checkoutSchema = z.object({ bundle: z.literal(true) });

export const progressSchema = z.object({
  lesson_id: z.uuid(),
  completed: z.boolean(),
  seconds_watched: z.coerce.number().int().min(0).max(86_400).optional(),
  quiz_score: z.coerce.number().int().min(0).max(100).nullable().optional(),
});

export type ProgressInput = z.infer<typeof progressSchema>;

export * from "./fields";
export * from "./admin";
export * from "./auth";
