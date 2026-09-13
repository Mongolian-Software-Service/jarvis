import "server-only";
import type { PaymentStatus } from "@jarvis/core";
import { createServerSupabase, supabaseConfigured } from "@/lib/supabase/server";

export type AdminPayment = {
  id: string;
  amount: number;
  status: PaymentStatus;
  provider: string;
  invoice: string | null;
  created: string;
  paidAt: string | null;
  student: string | null;
  /** Null for a bundle payment, which is every new one (§6.7). */
  course: string | null;
};

export async function listPayments(): Promise<AdminPayment[]> {
  if (!supabaseConfigured()) return [];
  const supabase = createServerSupabase();

  const { data } = await supabase
    .from("payments")
    /*
     * `courses` is a **left** join, not `courses!inner`.
     *
     * A bundle payment carries `course_id = null` — and since the school sells
     * only the bundle, that is every payment from now on (§6.7). An inner join
     * drops a row whose foreign key is null, so the console's payments screen
     * would have quietly shown nothing at all the day the first sale landed,
     * with no error anywhere to explain it.
     */
    .select(
      "id, amount_mnt, status, provider, invoice_id, created_at, paid_at, user_id, course_id, courses(title_mn), profiles!inner(full_name, email)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  return (data ?? []).map((row) => ({
    id: row.id,
    amount: row.amount_mnt,
    status: row.status,
    provider: row.provider,
    invoice: row.invoice_id,
    created: row.created_at,
    paidAt: row.paid_at,
    student: row.profiles?.full_name ?? row.profiles?.email ?? null,
    course: row.courses?.title_mn ?? null,
  }));
}
