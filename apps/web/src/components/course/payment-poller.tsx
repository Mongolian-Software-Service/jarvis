"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { INVOICE_LIFETIME_MS } from "@jarvis/core";

/**
 * Re-render the checkout page every few seconds while a payment is pending.
 *
 * The settlement happens on another machine — Bonum calls our webhook — so
 * nothing here can be told when it lands. `router.refresh()` re-runs the server
 * component, which reads the row again.
 *
 * It stops on its own when the invoice can no longer be paid. A tab left open
 * overnight polling a dead invoice is a bill nobody meant to run up.
 */
export function PaymentPoller({ intervalMs = 4000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const started = Date.now();
    const timer = setInterval(() => {
      if (Date.now() - started > INVOICE_LIFETIME_MS) {
        clearInterval(timer);
        return;
      }
      router.refresh();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [router, intervalMs]);

  return null;
}
