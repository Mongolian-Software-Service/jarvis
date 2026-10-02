import type { Metadata } from "next";
import { getIntl } from "@/lib/locale";
import { FeedbackForm } from "@/components/site/feedback-form";
import { ContactChannels, ContactNotes } from "@/components/site/contact-channels";
import { PageHeading } from "@/components/ui/page-heading";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getIntl();
  return { title: t.auth.settings.help, robots: { index: false } };
}

/**
 * «Тусламж» — the school's channels and the feedback form, inside settings.
 *
 * It used to be a tab of its own pointing at the public contact page. It lives
 * here now because a student looking for help is looking for something about
 * *their* account — a payment that did not open a course, a phone number to
 * change — and that is the section they are already in. The public page stays
 * for a visitor; this one always shows the form, because the layout above has
 * already established there is somebody signed in to send it.
 */
export default async function SettingsHelpPage() {
  const { t } = await getIntl();

  return (
    <div className="max-w-4xl">
      <PageHeading title={t.auth.settings.help} deck={t.marketing.contact.deck} />

      <div className="mt-8">
        <ContactChannels t={t} />
      </div>

      {/* The form beside the two notes on a laptop — «how soon» and «what to
          include» are read while writing, not after. */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <FeedbackForm t={t} />
        <ContactNotes t={t} className="space-y-6" />
      </div>
    </div>
  );
}
