"use client";

import { Field, Input } from "@/components/ui/field";

/**
 * Овог, нэр, утас — the three questions, asked the same way everywhere.
 *
 * The account page edits them and the completion dialog fills them in for a
 * Google sign-up. Two copies would drift the first time the validation changed,
 * and the placeholder is half of what teaches the format.
 */
export function ProfileFields({
  copy,
  errors,
  values,
}: {
  copy: { lastName: string; firstName: string; phone: string };
  errors: Record<string, string>;
  values?: { lastName?: string | null; firstName?: string | null; phone?: string | null };
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={copy.lastName} htmlFor="last_name" error={errors.last_name}>
          <Input
            id="last_name"
            name="last_name"
            autoComplete="family-name"
            defaultValue={values?.lastName ?? ""}
            placeholder="ж: Батбаярын"
            required
          />
        </Field>
        <Field label={copy.firstName} htmlFor="first_name" error={errors.first_name}>
          <Input
            id="first_name"
            name="first_name"
            autoComplete="given-name"
            defaultValue={values?.firstName ?? ""}
            placeholder="ж: Тэмүүлэн"
            required
          />
        </Field>
      </div>

      <Field label={copy.phone} htmlFor="phone" error={errors.phone}>
        <Input
          id="phone"
          name="phone"
          inputMode="numeric"
          autoComplete="tel-national"
          defaultValue={values?.phone ?? ""}
          placeholder="ж: 99112233"
          maxLength={16}
          required
        />
      </Field>
    </>
  );
}
