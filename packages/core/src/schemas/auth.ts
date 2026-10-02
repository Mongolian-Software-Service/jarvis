/**
 * The forms a student meets, as factories.
 *
 * A factory rather than a constant because the messages are copy: they live in
 * the string tables with everything else a person reads, and a schema that
 * carried its own English would be the one place the site was not translated.
 */
import { z } from "zod";
import { personName, phone } from "./fields";

export type ValidationCopy = {
  email: string;
  password: string;
  name: string;
  firstName: string;
  lastName: string;
  phone: string;
};

export function signInSchema(copy: ValidationCopy) {
  return z.object({
    email: z.email(copy.email),
    password: z.string().min(1, copy.password),
  });
}

export function signUpSchema(copy: ValidationCopy) {
  return z.object({
    last_name: personName(copy.lastName),
    first_name: personName(copy.firstName),
    email: z.email(copy.email),
    phone: phone(copy.phone),
    password: z.string().min(8, copy.password).max(72),
  });
}

/**
 * The three things a person tells us about themselves.
 *
 * The same shape edits the account and completes a Google sign-up, because they
 * are the same question asked at two moments — and a second schema would be a
 * second set of rules to keep in step with the column constraints.
 */
export function profileSchema(copy: ValidationCopy) {
  return z.object({
    last_name: personName(copy.lastName),
    first_name: personName(copy.firstName),
    phone: phone(copy.phone),
  });
}

/**
 * Changing a password, from «Хувийн мэдээлэл».
 *
 * The bounds are `signUpSchema`'s, said once more: eight because Supabase
 * enforces eight (`scripts/supabase/auth.mjs`) and the form should refuse what
 * the server would, 72 because bcrypt reads no further — a longer password is
 * silently cut, and a person should not find that out by being locked out.
 *
 * The repeat is checked here rather than in the browser, so the message lands
 * under the field that is wrong, like every other message on the form.
 */
export function passwordSchema(copy: {
  current: string;
  next: string;
  mismatch: string;
  same: string;
}) {
  return z
    .object({
      current: z.string().min(1, copy.current),
      next: z.string().min(8, copy.next).max(72, copy.next),
      confirm: z.string(),
    })
    .refine((value) => value.next === value.confirm, { path: ["confirm"], message: copy.mismatch })
    // Supabase refuses this too (`same_password`), but only after the current
    // password has been checked — said here, it costs no round trip.
    .refine((value) => value.next !== value.current, { path: ["next"], message: copy.same });
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

/**
 * What a student writes in «Санал хүсэлт».
 *
 * The bounds are the table's own `check` constraint, in the one place the form
 * can read them — so a message the database would refuse is refused in the
 * field instead of by a 400 the reader cannot act on.
 */
export function feedbackSchema(copy: { tooShort: string; tooLong: string }) {
  return z.object({
    body: z.string().trim().min(4, copy.tooShort).max(4000, copy.tooLong),
  });
}
