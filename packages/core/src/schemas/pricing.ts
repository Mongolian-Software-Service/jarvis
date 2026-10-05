/**
 * The bundle's price, as the console may set it.
 *
 * The same three rules as the table's own `check` constraints
 * (20261005000100), so the form says what is wrong under the field instead of
 * the database refusing the row with a constraint name. The database stays
 * the guarantee; this is the explanation.
 */
import { z } from "zod";

/**
 * `199,000`, `199 000` and `199000₮` all mean the same amount.
 *
 * A separator is dropped only where it splits off a group of three digits.
 * Stripping every `.` and `,` turned `499000.50` into 49,900,050₮ — a typo a
 * hundred times the price, inside the cap and saved without a word. Left in
 * place, the decimal tail fails the integer check under the field instead.
 */
const digitsOnly = (value: unknown) =>
  typeof value === "string"
    ? value
        .replace(/₮/g, "")
        .trim()
        .replace(/[\s,.'](?=\d{3}(?!\d))/g, "")
    : value;

const tugrug = z.preprocess(
  digitsOnly,
  z.coerce
    .number("Тоо оруулна уу")
    .int("Бүхэл тоо оруулна уу")
    .min(1000, "Хамгийн багадаа 1,000₮")
    .max(100_000_000, "Хэт их дүн байна"),
);

const optionalTugrug = z.preprocess(
  (value) => (digitsOnly(value) === "" ? null : digitsOnly(value)),
  tugrug.nullable(),
);

const optionalDay = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .refine(
    (value) =>
      value === null || (/^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value))),
    "Огноо буруу байна",
  );

export const bundlePricingSchema = z
  .object({
    price_mnt: tugrug,
    launch_price_mnt: optionalTugrug,
    launch_last_day: optionalDay,
  })
  .superRefine((value, ctx) => {
    // Half a launch — a price with no end, or an end with no price — is the
    // struck-number lie the launch replaced (§1).
    if ((value.launch_price_mnt === null) !== (value.launch_last_day === null)) {
      ctx.addIssue({
        code: "custom",
        path: [value.launch_price_mnt === null ? "launch_price_mnt" : "launch_last_day"],
        message: "Нээлтийн үнэ болон сүүлийн өдрийг хамт бөглөнө үү",
      });
    }
    if (value.launch_price_mnt !== null && value.launch_price_mnt >= value.price_mnt) {
      ctx.addIssue({
        code: "custom",
        path: ["launch_price_mnt"],
        message: "Нээлтийн үнэ үндсэн үнээс бага байх ёстой",
      });
    }
  });

export type BundlePricingInput = z.infer<typeof bundlePricingSchema>;
