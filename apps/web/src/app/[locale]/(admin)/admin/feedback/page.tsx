import type { Metadata } from "next";
import { getIntl } from "@/lib/locale";
import { listFeedback } from "@/lib/queries/admin";
import { FeedbackTable } from "@/components/admin/feedback-table";

export const metadata: Metadata = { robots: { index: false } };

/** «Санал хүсэлт» — what students have written, newest first. */
export default async function AdminFeedbackPage() {
  const { locale, t } = await getIntl();
  const messages = await listFeedback();

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="font-display text-[26px]">{t.admin.feedback.title}</h1>
        <p className="text-ink-3 measure text-[13.5px]">{t.admin.feedback.deck}</p>
      </header>

      <FeedbackTable messages={messages} locale={locale} t={t} />
    </div>
  );
}
