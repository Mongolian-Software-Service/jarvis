/**
 * «Миний төслүүд» — the one form a student fills about something they made.
 *
 * No course: a project is the student's, not a track's (20261002000300).
 *
 * A factory, like the other student-facing schemas, because the messages are
 * copy and live in the string table.
 */
import { z } from "zod";
import { normalizeProjectUrl, PROJECT_DESCRIPTION_MAX, PROJECT_TITLE_MAX } from "../projects";

export type ProjectCopy = {
  url: string;
  title: string;
  description: string;
};

/**
 * The URL is normalised **inside** the schema, not before it: the action and
 * the form then agree not only on what is valid but on what is stored, and a
 * pasted `minii-huudas.vercel.app` comes out of `parse` as the `https://` link
 * the column expects.
 */
export function projectSchema(copy: ProjectCopy) {
  return z.object({
    url: z.string().transform((value, ctx) => {
      const url = normalizeProjectUrl(value);
      if (url) return url;
      ctx.addIssue({ code: "custom", message: copy.url });
      return z.NEVER;
    }),
    // An empty box is no name — the address stands in for it.
    title: optionalBounded(PROJECT_TITLE_MAX, copy.title),
    description: optionalBounded(PROJECT_DESCRIPTION_MAX, copy.description),
  });
}

/** Trimmed, at most `max`, and null when empty — the column's own `check`. */
function optionalBounded(max: number, message: string) {
  return z
    .string()
    .trim()
    .max(max, message)
    .transform((value) => (value === "" ? null : value))
    .nullable();
}

/**
 * Which project an edit or a delete is about. The owner is never in the form —
 * it is the session — so this is the whole of what the browser gets to say.
 */
export const projectIdSchema = z.uuid();
