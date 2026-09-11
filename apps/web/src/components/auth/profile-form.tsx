"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { LOCALES, LOCALE_NAMES, type Locale } from "@jarvis/core";
import { updateProfile } from "@/lib/actions/auth";
import { Field, Input, Select } from "@/components/ui/field";
import { buttonClass } from "@/components/ui/button";
import type { ActionResult } from "@/lib/actions/guard";

export function ProfileForm({
  fullName,
  email,
  locale,
  copy,
}: {
  fullName: string;
  email: string;
  locale: Locale;
  copy: {
    name: string;
    email: string;
    emailNote: string;
    language: string;
    save: string;
    saving: string;
    saved: string;
  };
}) {
  const [state, submit, pending] = useActionState<ActionResult | null, FormData>(
    updateProfile,
    null,
  );
  const fields = state && !state.ok ? (state.fields ?? {}) : {};

  return (
    <form action={submit} className="space-y-5">
      <Field label={copy.name} htmlFor="full_name" error={fields.full_name}>
        <Input id="full_name" name="full_name" defaultValue={fullName} required />
      </Field>

      <Field label={copy.email} htmlFor="email" hint={copy.emailNote}>
        {/* Read-only rather than absent: somebody checking which account they
            are signed into should not have to go and find out elsewhere. */}
        <Input id="email" defaultValue={email} disabled readOnly />
      </Field>

      <Field label={copy.language} htmlFor="locale">
        <Select id="locale" name="locale" defaultValue={locale}>
          {LOCALES.map((code) => (
            <option key={code} value={code}>
              {LOCALE_NAMES[code]}
            </option>
          ))}
        </Select>
      </Field>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={buttonClass("primary", "md")}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {pending ? copy.saving : copy.save}
        </button>
        {state?.ok ? <span className="text-sm text-ok">{copy.saved}</span> : null}
        {state && !state.ok && !Object.keys(fields).length ? (
          <span className="text-sm text-bad">{state.error}</span>
        ) : null}
      </div>
    </form>
  );
}
