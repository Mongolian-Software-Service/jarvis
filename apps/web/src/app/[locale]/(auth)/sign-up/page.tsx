import type { Metadata } from "next";
import { signInPath } from "@jarvis/core";
import { getIntl } from "@/lib/locale";
import { AuthForm } from "@/components/auth/auth-form";
import { GoogleButton, OrDivider } from "@/components/auth/google-button";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getIntl();
  return { title: t.auth.signUp.title, robots: { index: false } };
}

export default async function SignUpPage() {
  const { locale, t } = await getIntl();

  return (
    <>
      <header className="mb-6 text-center">
        <h1 className="font-display text-[22px]">{t.auth.signUp.title}</h1>
        <p className="mt-1.5 text-[13px] text-ink-3">{t.auth.signUp.deck}</p>
      </header>

      {/* The same button as the sign-in page, deliberately. An address Google
          has and Supabase has not becomes an account on the first tap. */}
      <div className="mb-5 space-y-5">
        <GoogleButton label={t.auth.google.continue} opening={t.auth.google.opening} />
        <OrDivider label={t.auth.google.or} />
      </div>

      <AuthForm
        mode="sign-up"
        copy={{
          lastName: t.auth.signUp.lastName,
          lastNamePlaceholder: t.auth.signUp.lastNamePlaceholder,
          firstName: t.auth.signUp.firstName,
          firstNamePlaceholder: t.auth.signUp.firstNamePlaceholder,
          email: t.auth.signUp.email,
          emailPlaceholder: t.auth.signUp.emailPlaceholder,
          phone: t.auth.signUp.phone,
          phonePlaceholder: t.auth.signUp.phonePlaceholder,
          password: t.auth.signUp.password,
          passwordPlaceholder: t.auth.signUp.passwordPlaceholder,
          passwordHint: t.auth.signUp.passwordHint,
          submit: t.auth.signUp.submit,
          submitting: t.auth.signUp.submitting,
          footer: t.auth.signUp.haveAccount,
          footerAction: t.auth.signUp.signIn,
          footerHref: signInPath(locale),
          checkEmail: t.auth.signUp.checkEmail,
          checkEmailBody: t.auth.signUp.checkEmailBody,
        }}
      />
    </>
  );
}
