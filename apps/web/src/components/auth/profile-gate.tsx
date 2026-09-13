"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { postponeProfile, updateProfile } from "@/lib/actions/auth";
import { ProfileFields } from "@/components/auth/profile-fields";
import { buttonClass } from "@/components/ui/button";
import type { ActionResult } from "@/lib/actions/guard";

/**
 * The two questions Google cannot answer.
 *
 * Signing in with Google hands over a name and an address and nothing else — no
 * овог/нэр split a Mongolian form can rely on, and never a phone number, which
 * is the school's only reliable way to reach somebody whose payment failed. So
 * the first screen after that sign-in asks, once.
 *
 * It is a dialog rather than a redirect to a form: a redirect loses wherever
 * they were going, and this is a detour, not a gate. «Дараа бөглөнө» sets a
 * cookie for a day — asked again tomorrow, not on the next click.
 *
 * The server decides whether it appears at all (`profileIsComplete`), so there
 * is no flash of a dialog for somebody who already answered.
 */
export function ProfileGate({
  values,
  copy,
}: {
  values: { lastName: string | null; firstName: string | null; phone: string | null };
  copy: {
    title: string;
    deck: string;
    lastName: string;
    firstName: string;
    phone: string;
    submit: string;
    submitting: string;
    later: string;
  };
}) {
  const [state, submit, pending] = useActionState<ActionResult | null, FormData>(
    updateProfile,
    null,
  );
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || state?.ok) return null;
  const fields = state && !state.ok ? (state.fields ?? {}) : {};

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={copy.title}
      className="fixed inset-0 z-50 grid place-items-center p-5"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: "rgba(8,9,10,.72)", backdropFilter: "blur(6px)" }}
      />

      <div className="panel-raised relative w-full max-w-md p-6 sm:p-7">
        <h2 className="font-display text-[20px] leading-[1.2]">{copy.title}</h2>
        <p className="text-ink-3 mt-1.5 text-[13.5px] leading-relaxed">{copy.deck}</p>

        <form action={submit} className="mt-6 space-y-4">
          <ProfileFields copy={copy} errors={fields} values={values} />

          {state && !state.ok && !Object.keys(fields).length ? (
            <p className="border-bad/30 bg-bad-soft text-bad rounded-md border px-3 py-2 text-sm">
              {state.error}
            </p>
          ) : null}

          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                setDismissed(true);
                void postponeProfile();
              }}
              className="text-ink-3 hover:text-ink text-[13px] transition-colors"
            >
              {copy.later}
            </button>

            <button
              type="submit"
              disabled={pending}
              className={buttonClass("primary", "md", "shrink-0")}
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              {pending ? copy.submitting : copy.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
