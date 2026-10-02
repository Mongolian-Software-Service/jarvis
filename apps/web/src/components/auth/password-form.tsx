"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import type { Strings } from "@jarvis/core";
import { changePassword } from "@/lib/actions/password";
import { Field, Input } from "@/components/ui/field";
import { buttonClass } from "@/components/ui/button";
import type { ActionResult } from "@/lib/actions/guard";

/**
 * Current password, the new one, the new one again.
 *
 * No `minLength` on the inputs: the browser would answer it with its own
 * bubble, in the browser's language, before the Mongolian message under the
 * field ever had a chance. The schema says eight, once, on the server.
 *
 * React clears an uncontrolled form after every action, a refusal included.
 * For a password that is the right behaviour rather than a cost — nothing
 * typed into these fields should outlive the attempt.
 */
export function PasswordForm({
  email,
  copy,
}: {
  email: string;
  copy: Strings["auth"]["password"];
}) {
  const [state, submit, pending] = useActionState<ActionResult | null, FormData>(
    changePassword,
    null,
  );
  const fields = state && !state.ok ? (state.fields ?? {}) : {};

  return (
    <form action={submit} className="space-y-5">
      {/* For the password manager: without an account name beside it, a saved
          password is filed under nobody and offered to nobody. */}
      <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />

      <Field label={copy.current} htmlFor="current" error={fields.current}>
        <Input id="current" name="current" type="password" autoComplete="current-password" required />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={copy.next} htmlFor="next" hint={copy.nextHint} error={fields.next}>
          <Input id="next" name="next" type="password" autoComplete="new-password" required />
        </Field>
        <Field label={copy.confirm} htmlFor="confirm" error={fields.confirm}>
          <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className={buttonClass("secondary", "md")}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {pending ? copy.submitting : copy.submit}
        </button>
        {state?.ok ? <span className="text-ok text-sm">{copy.saved}</span> : null}
        {state && !state.ok && !Object.keys(fields).length ? (
          <span className="text-bad text-sm">{state.error}</span>
        ) : null}
      </div>
    </form>
  );
}
