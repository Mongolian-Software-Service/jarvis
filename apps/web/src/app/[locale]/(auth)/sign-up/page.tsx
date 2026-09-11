import type { Metadata } from "next";
import { signInPath } from "@jarvis/core";
import { getIntl } from "@/lib/locale";
import { AuthForm } from "@/components/auth/auth-form";

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

      <AuthForm
        mode="sign-up"
        copy={{
          name: t.auth.signUp.name,
          namePlaceholder: t.auth.signUp.namePlaceholder,
          email: t.auth.signUp.email,
          password: t.auth.signUp.password,
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
