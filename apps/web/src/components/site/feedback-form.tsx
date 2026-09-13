"use client";

import { useActionState, useState } from "react";
import { Check, Loader2, Send } from "lucide-react";
import type { Strings } from "@jarvis/core";
import { sendFeedback } from "@/lib/actions/feedback";
import { Field, Textarea } from "@/components/ui/field";
import { buttonClass } from "@/components/ui/button";
import type { ActionResult } from "@/lib/actions/guard";

/**
 * «Санал хүсэлт» — a student writes, the console reads.
 *
 * Only the message is asked for. The name, phone and address the team needs to
 * answer come from the account, so asking again would be three fields the
 * student has already filled in once — and three chances for the phone number
 * on the message to disagree with the phone number on the profile.
 *
 * The server decides whether this renders at all: it is only mounted for
 * somebody signed in, because a request nobody can be traced back to is not
 * one the team can answer.
 */
export function FeedbackForm({ t }: { t: Strings }) {
  const copy = t.marketing.contact.feedback;
  const [state, submit, pending] = useActionState<ActionResult | null, FormData>(
    sendFeedback,
    null,
  );
  // Cleared by «Дахин бичих», so somebody with a second thought is not sent
  // back through the page to find this form again.
  const [again, setAgain] = useState(0);

  if (state?.ok && again === 0) {
    return (
      <div className="panel space-y-3 p-5 sm:p-6">
        <p className="text-ok flex items-center gap-2 text-[14px]">
          <Check className="size-4 shrink-0" aria-hidden="true" />
          {copy.sent}
        </p>
        <button
          type="button"
          onClick={() => setAgain((value) => value + 1)}
          className="text-ink-3 hover:text-ink text-[13px] transition-colors"
        >
          {copy.sendAnother}
        </button>
      </div>
    );
  }

  const fields = state && !state.ok ? (state.fields ?? {}) : {};

  return (
    <form action={submit} className="panel space-y-4 p-5 sm:p-6">
      <div>
        <h2 className="font-display text-[17px]">{copy.title}</h2>
        <p className="text-ink-3 mt-1 text-[13px]">{copy.body}</p>
      </div>

      <Field label={copy.label} htmlFor="body" error={fields.body}>
        <Textarea
          id="body"
          name="body"
          required
          minLength={4}
          maxLength={4000}
          placeholder={copy.placeholder}
          className="min-h-32"
        />
      </Field>

      {state && !state.ok && !Object.keys(fields).length ? (
        <p className="border-bad/30 bg-bad-soft text-bad rounded-md border px-3 py-2 text-sm">
          {state.error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className={buttonClass("primary", "md")}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        {pending ? copy.submitting : copy.submit}
      </button>
    </form>
  );
}
