import type { Metadata } from "next";
import { signUpPath } from "@jarvis/core";
import { getIntl } from "@/lib/locale";
import { AuthForm } from "@/components/auth/auth-form";
import { GoogleButton, OrDivider } from "@/components/auth/google-button";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getIntl();
  return { title: t.auth.signIn.title, robots: { index: false } };
}

export default async function SignInPage({ searchParams }: PageProps<"/[locale]/sign-in">) {
  const { locale, t } = await getIntl();
  const { next, error } = await searchParams;

  return (
    <>
      <header className="mb-6 text-center">
        <h1 className="font-display text-[22px]">{t.auth.signIn.title}</h1>
        <p className="mt-1.5 text-[13px] text-ink-3">{t.auth.signIn.deck}</p>
      </header>

      {error === "confirm" ? (
        <p className="mb-4 rounded-md border border-warn/30 bg-warn-soft px-3 py-2 text-sm text-warn">
          {t.auth.errors.unknown}
        </p>
      ) : null}

      {error === "oauth" ? (
        <p className="mb-4 rounded-md border border-bad/30 bg-bad-soft px-3 py-2 text-sm text-bad">
          {t.auth.google.failed}
        </p>
      ) : null}

      {/* Google first: it is one tap against three fields, and most people
          reaching this screen already have the account it would make. */}
      <div className="mb-5 space-y-5">
        <GoogleButton
          label={t.auth.google.continue}
          opening={t.auth.google.opening}
          next={typeof next === "string" ? next : undefined}
        />
        <OrDivider label={t.auth.google.or} />
      </div>

      <AuthForm
        mode="sign-in"
        next={typeof next === "string" ? next : undefined}
        copy={{
          email: t.auth.signIn.email,
          emailPlaceholder: t.auth.signIn.emailPlaceholder,
          password: t.auth.signIn.password,
          passwordPlaceholder: t.auth.signIn.passwordPlaceholder,
          submit: t.auth.signIn.submit,
          submitting: t.auth.signIn.submitting,
          footer: t.auth.signIn.noAccount,
          footerAction: t.auth.signIn.createOne,
          footerHref: signUpPath(locale),
        }}
      />
    </>
  );
}
