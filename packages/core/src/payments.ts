import type { Enums } from "@jarvis/types";
import type { Locale } from "./locale";

export type PaymentStatus = Enums<"payment_status">;

/**
 * What a gateway's status word means to a screen.
 *
 * The gateway's vocabulary is not ours — Bonum answers `FAILED`, `EXPIRED`,
 * `CANCELLED` and others we have not met — and three states is what any screen
 * actually needs. The original word is kept in `payments.raw` for the console.
 */
export type PaymentState = "paid" | "pending" | "failed";

export function paymentState(status: string): PaymentState {
  const value = status.trim().toLowerCase();
  if (value === "paid" || value === "success" || value === "succeeded") return "paid";
  if (value === "pending" || value === "created" || value === "new") return "pending";
  return "failed";
}

/** The status word the database column takes, from whatever the gateway said. */
export function toPaymentStatus(raw: string): PaymentStatus {
  const state = paymentState(raw);
  if (state === "paid") return "paid";
  if (state === "pending") return "pending";
  return raw.toLowerCase().includes("expir") ? "expired" : "failed";
}

const STATUS_LABELS: Record<Locale, Record<PaymentStatus, string>> = {
  mn: { pending: "Хүлээгдэж буй", paid: "Төлөгдсөн", failed: "Амжилтгүй", expired: "Хугацаа дууссан" },
  en: { pending: "Pending", paid: "Paid", failed: "Failed", expired: "Expired" },
};

export function paymentLabel(status: PaymentStatus, locale: Locale): string {
  return STATUS_LABELS[locale][status];
}

/**
 * How long an invoice stays payable — the `expiresIn` sent with every one.
 *
 * A checkout still pending past this was abandoned or lost its callback, and
 * calling it "хүлээгдэж байна" a day later is a lie the screen tells because
 * nothing ever moved the row on.
 */
export const INVOICE_LIFETIME_MS = 30 * 60 * 1000;

export function isStalePending(status: PaymentStatus, createdAt: string, now = Date.now()): boolean {
  if (status !== "pending") return false;
  return now - new Date(createdAt).getTime() > INVOICE_LIFETIME_MS;
}

/**
 * What a course purchase is called on the payer's bank statement.
 *
 * Not interface copy and deliberately not translated: the statement is printed
 * by a Mongolian bank and should read the same whichever language the buyer
 * happened to have the app in.
 */
export const COURSE_REMARK_MN = "Сургалтын эрх";
