import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { accountPath, signInPath } from "@jarvis/core";
import { getIntl } from "@/lib/locale";
import { getSignIn, getViewer } from "@/lib/queries/viewer";
import { signOut } from "@/lib/actions/auth";
import { ProfileForm } from "@/components/auth/profile-form";
import { PasswordForm } from "@/components/auth/password-form";
import { PageHeading } from "@/components/ui/page-heading";
import { buttonClass } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getIntl();
  return { title: t.auth.settings.profile, robots: { index: false } };
}

/** The first category of «Тохиргоо»: who they are, how they sign in, and the way out. */
export default async function AccountPage() {
  const { locale, t } = await getIntl();
  const viewer = await getViewer();

  // The proxy already turns anonymous visitors away; this is the second lock,
  // for the case where it is ever loosened.
  if (!viewer) redirect(signInPath(locale, accountPath(locale)));

  const copy = t.auth.account;
  const password = t.auth.password;
  const account = await getSignIn();

  return (
    <div className="max-w-2xl">
      <PageHeading title={t.auth.settings.profile} deck={t.auth.settings.profileDeck} />

      <div className="panel mt-8 p-6">
        <ProfileForm
          lastName={viewer.lastName}
          firstName={viewer.firstName}
          phone={viewer.phone}
          email={viewer.email ?? ""}
          copy={{
            lastName: copy.lastName,
            firstName: copy.firstName,
            phone: copy.phone,
            email: copy.email,
            emailNote: copy.emailNote,
            save: copy.save,
            saving: copy.saving,
            saved: copy.saved,
          }}
        />
      </div>

      {/*
       * Its own panel, with its own button. Folded into the form above, one
       * «Хадгалах» would either change a password nobody meant to touch or
       * refuse a new phone number for want of the current password.
       */}
      {account ? (
        <section className="panel mt-4 p-6">
          <h2 className="text-[15px] leading-[1.3]">{password.title}</h2>
          {account.hasPassword ? (
            <>
              <p className="text-ink-3 mt-1 text-[13px]">{password.deck}</p>
              <div className="mt-5">
                <PasswordForm email={account.email} copy={password} />
              </div>
            </>
          ) : (
            <p className="text-ink-3 mt-1 text-[13px]">{password.googleOnly}</p>
          )}
        </section>
      ) : null}

      {/*
       * Its own row, not a second button under the form. Beside «Хадгалах» it
       * read as the other half of the form — a pair where one keeps your edits
       * and the other throws you out.
       */}
      <div className="panel mt-4 flex flex-wrap items-center justify-between gap-4 p-6">
        <div className="min-w-0">
          <h2 className="text-[15px] leading-[1.3]">{copy.signOutTitle}</h2>
          <p className="text-ink-3 mt-1 text-[13px]">{copy.signOutDeck}</p>
        </div>
        <form action={signOut}>
          <button type="submit" className={buttonClass("secondary", "md")}>
            {copy.signOut}
          </button>
        </form>
      </div>
    </div>
  );
}
