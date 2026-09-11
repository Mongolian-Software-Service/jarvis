import type { Metadata } from "next";
import { getIntl } from "@/lib/locale";
import { listPayments } from "@/lib/queries/admin";
import { PaymentTable } from "@/components/admin/payment-table";

export const metadata: Metadata = { robots: { index: false } };

export default async function AdminPaymentsPage() {
  const { locale, t } = await getIntl();
  const payments = await listPayments();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-[26px]">{t.admin.payments.title}</h1>
      <PaymentTable payments={payments} locale={locale} t={t} />
    </div>
  );
}
