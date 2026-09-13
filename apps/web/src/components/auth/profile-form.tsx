"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { updateProfile } from "@/lib/actions/auth";
import { Field, Input } from "@/components/ui/field";
import { ProfileFields } from "@/components/auth/profile-fields";
import { buttonClass } from "@/components/ui/button";
import type { ActionResult } from "@/lib/actions/guard";

export function ProfileForm({
  lastName,
  firstName,
  phone,
  email,
  copy,
}: {
  lastName: string | null;
  firstName: string | null;
  phone: string | null;
  email: string;
  copy: {
    lastName: string;
    firstName: string;
    phone: string;
    email: string;
    emailNote: string;
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
      <ProfileFields copy={copy} errors={fields} values={{ lastName, firstName, phone }} />

      <Field label={copy.email} htmlFor="email" hint={copy.emailNote}>
        {/* Read-only rather than absent: somebody checking which account they
            are signed into should not have to go and find out elsewhere. */}
        <Input id="email" defaultValue={email} disabled readOnly />
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
