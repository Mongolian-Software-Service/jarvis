import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { signInPath } from "@jarvis/core";
import { getIntl } from "@/lib/locale";
import { getViewer } from "@/lib/queries/viewer";
import { signOut } from "@/lib/actions/auth";
import { ProfileForm } from "@/components/auth/profile-form";
import { buttonClass } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getIntl();
  return { title: t.auth.account.title, robots: { index: false } };
}

export default async function AccountPage() {
  const { locale, t } = await getIntl();
  const viewer = await getViewer();

  // The proxy already turns anonymous visitors away; this is the second lock,
  // for the case where it is ever loosened.
  if (!viewer) redirect(signInPath(locale, `/${locale}/account`));

  return (
    <div className="shell max-w-xl py-12">
      <h1 className="font-display mb-8 text-[32px]">{t.auth.account.title}</h1>

      <div className="panel p-6">
        <ProfileForm
          fullName={viewer.fullName ?? ""}
          email={viewer.email ?? ""}
          locale={locale}
          copy={{
            name: t.auth.account.name,
            email: t.auth.account.email,
            emailNote: t.auth.account.emailNote,
            language: t.auth.account.language,
            save: t.actions.save,
            saving: t.actions.saving,
            saved: t.auth.account.saved,
          }}
        />
      </div>

      <form action={signOut} className="mt-6">
        <button type="submit" className={buttonClass("secondary", "md")}>
          {t.auth.account.signOut}
        </button>
      </form>
    </div>
  );
}
