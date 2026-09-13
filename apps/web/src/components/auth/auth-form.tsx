"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { signIn, signUp } from "@/lib/actions/auth";
import { Field, Input } from "@/components/ui/field";
import { buttonClass } from "@/components/ui/button";
import type { ActionResult } from "@/lib/actions/guard";

type Copy = {
  lastName?: string;
  lastNamePlaceholder?: string;
  firstName?: string;
  firstNamePlaceholder?: string;
  phone?: string;
  phonePlaceholder?: string;
  emailPlaceholder?: string;
  passwordPlaceholder?: string;
  email: string;
  password: string;
  passwordHint?: string;
  submit: string;
  submitting: string;
  footer: string;
  footerAction: string;
  footerHref: string;
  checkEmail?: string;
  checkEmailBody?: string;
};

/**
 * One form component for both sign-in and sign-up.
 *
 * They differ by one field and one action; two components would be two places
 * to fix the next thing either of them gets wrong. `useActionState` keeps the
 * typed result — including the per-field messages zod produced — without any
 * state of its own.
 */
export function AuthForm({
  mode,
  copy,
  next,
}: {
  mode: "sign-in" | "sign-up";
  copy: Copy;
  next?: string;
}) {
  const action = mode === "sign-in" ? signIn : signUp;
  const [state, submit, pending] = useActionState<ActionResult<{ confirm: boolean }> | null, FormData>(
    action as (prev: unknown, form: FormData) => Promise<ActionResult<{ confirm: boolean }>>,
    null,
  );

  // Sign-up with confirmations on returns here rather than redirecting: the
  // account exists but has no session until the emailed link is followed.
  if (state?.ok && state.data?.confirm && copy.checkEmail) {
    return (
      <div className="space-y-2 text-center">
        <h2 className="font-display text-xl font-medium">{copy.checkEmail}</h2>
        <p className="text-sm text-ink-2">{copy.checkEmailBody}</p>
      </div>
    );
  }

  const fields = state && !state.ok ? (state.fields ?? {}) : {};

  return (
    <form action={submit} className="space-y-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {/*
        * Овог and нэр side by side, овог first — that is the order a Mongolian
        * name is written and read in, and a form that asks for them the other
        * way round gets them the other way round.
        */}
      {mode === "sign-up" && copy.lastName && copy.firstName ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={copy.lastName} htmlFor="last_name" error={fields.last_name}>
            <Input
              id="last_name"
              name="last_name"
              autoComplete="family-name"
              placeholder={copy.lastNamePlaceholder}
              required
            />
          </Field>
          <Field label={copy.firstName} htmlFor="first_name" error={fields.first_name}>
            <Input
              id="first_name"
              name="first_name"
              autoComplete="given-name"
              placeholder={copy.firstNamePlaceholder}
              required
            />
          </Field>
        </div>
      ) : null}

      <Field label={copy.email} htmlFor="email" error={fields.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder={copy.emailPlaceholder}
          required
        />
      </Field>

      {mode === "sign-up" && copy.phone ? (
        <Field label={copy.phone} htmlFor="phone" error={fields.phone}>
          {/* `inputMode="numeric"` gives a phone the number pad without the
              `type="tel"` keyboard's dial-pad symbols, which are not part of a
              Mongolian number. */}
          <Input
            id="phone"
            name="phone"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder={copy.phonePlaceholder}
            maxLength={12}
            required
          />
        </Field>
      ) : null}

      <Field
        label={copy.password}
        htmlFor="password"
        hint={mode === "sign-up" ? copy.passwordHint : undefined}
        error={fields.password}
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
          placeholder={copy.passwordPlaceholder}
          required
        />
      </Field>

      {state && !state.ok && !Object.keys(fields).length ? (
        <p className="rounded-md border border-bad/30 bg-bad-soft px-3 py-2 text-sm text-bad">
          {state.error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className={buttonClass("primary", "lg", "w-full")}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        {pending ? copy.submitting : copy.submit}
      </button>

      <p className="text-center text-sm text-ink-3">
        {copy.footer}{" "}
        <Link href={copy.footerHref} className="text-accent hover:text-accent-hover">
          {copy.footerAction}
        </Link>
      </p>
    </form>
  );
}
