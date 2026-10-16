/**
 * The field types every form here is built from.
 *
 * Each encodes one thing HTML gets wrong on the way to a server: an empty box
 * arrives as `""` and not as null, an unticked checkbox arrives as nothing at
 * all, and a phone number arrives in whatever shape the person types it.
 * Fixing that once per field beats fixing it once per form.
 */
import { z } from "zod";
import { SLUG_PATTERN } from "../slug";

/** A form field that is empty means null, not "". */
export const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .nullable();

/** An HTML checkbox posts "on" when ticked and nothing at all when not. */
export const checkbox = z
  .union([z.literal("on"), z.literal("true"), z.literal("false"), z.literal(""), z.undefined()])
  .transform((value) => value === "on" || value === "true");

export const slug = z
  .string()
  .trim()
  .min(2, "Хаяг хэт богино байна")
  .max(80, "Хаяг хэт урт байна")
  .regex(SLUG_PATTERN, "Зөвхөн латин жижиг үсэг, тоо, дундуур зураас (жишээ: react-next)");

export const optionalUrl = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .refine(
    (value) => value === null || /^https?:\/\//i.test(value),
    "http эсвэл https хаяг оруулна уу",
  );

// ── Courses ──────────────────────────────────────────────────────────────────

/**
 * A Mongolian mobile number, stored as eight bare digits.
 *
 * People type `+976 9911 2233`, `99112233`, `976-99112233` and mean one thing,
 * so the spacing and the country code come off before anything is checked or
 * stored — two students who typed it differently are then one number, and the
 * column's own constraint has nothing left to argue with.
 *
 * The country code comes off only when it **is** one: eleven digits that begin
 * 976. G-Mobile numbers begin 97, so `9761 2345` is a whole number that happens
 * to start with the same three digits — stripping them on sight left five, and
 * everybody with such a number was refused at sign-up and by the profile gate.
 * `00976…` is the same code dialled the long way.
 */
export const phone = (message: string) =>
  z
    .string()
    .trim()
    .transform((value) => {
      const digits = value.replace(/\D/g, "").replace(/^00(?=976)/, "");
      return digits.length === 11 && digits.startsWith("976") ? digits.slice(3) : digits;
    })
    .refine((value) => /^[0-9]{8}$/.test(value), message);

export const personName = (message: string) => z.string().trim().min(2, message).max(60);
