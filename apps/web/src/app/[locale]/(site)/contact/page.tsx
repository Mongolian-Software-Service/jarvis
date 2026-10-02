import type { Metadata } from "next";
import { getIntl } from "@/lib/locale";
import { getViewer } from "@/lib/queries/viewer";
import { FeedbackForm } from "@/components/site/feedback-form";
import { ContactChannels, ContactNotes } from "@/components/site/contact-channels";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getIntl();
  return pageMetadata({
    locale,
    title: t.marketing.contact.title,
    description: t.marketing.contact.deck,
    path: "/contact",
  });
}

/**
 * The public way to reach the school — for a visitor deciding whether to buy.
 * A student has the same channels, and the form, under «Тохиргоо → Тусламж».
 */
export default async function ContactPage() {
  const { t } = await getIntl();
  const copy = t.marketing.contact;
  /*
   * The form is for students, not for visitors.
   *
   * A request carries the sender's name, phone and address from their profile
   * (§5) — so a signed-out person has none of those, and the console would get
   * a message it cannot answer. They get the channels above instead, which is
   * what those are for.
   */
  const viewer = await getViewer();

  return (
    <>
      <section className="shell pt-16 pb-10 sm:pt-20">
        <p className="kicker mb-4">{copy.kicker}</p>
        <h1 className="font-display max-w-2xl text-[2rem] leading-[1.1] sm:text-[2.75rem]">
          {copy.title}
        </h1>
        <p className="measure text-ink-2 mt-5 text-[15px]">{copy.deck}</p>
      </section>

      <section className="shell pb-12">
        <ContactChannels t={t} />
      </section>

      <section className="shell border-line border-t py-12">
        <ContactNotes t={t} className="grid gap-8 sm:grid-cols-2" />
      </section>

      {viewer ? (
        <section className="shell pb-16">
          <div className="max-w-xl">
            <FeedbackForm t={t} />
          </div>
        </section>
      ) : null}
    </>
  );
}
