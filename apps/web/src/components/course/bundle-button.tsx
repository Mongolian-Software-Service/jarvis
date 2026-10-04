"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { learnPath, signInPath, type Locale } from "@jarvis/core";
import { buttonClass } from "@/components/ui/button";

/**
 * Buy everything.
 *
 * Sends `{ bundle: true }` and no price — the amount comes from one constant on
 * the server. A price that arrives with the request is a price the buyer chose.
 */
export function BundleButton({
  locale,
  owned,
  signedIn,
  labels,
}: {
  locale: Locale;
  owned: boolean;
  signedIn: boolean;
  labels: { buy: string; buying: string; owned: string; signIn: string; error: string };
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (owned) {
    return (
      <Link href={learnPath(locale)} className={buttonClass("primary", "lg")}>
        {labels.owned}
        <ArrowRight className="size-3.5" />
      </Link>
    );
  }

  if (!signedIn) {
    return (
      <Link href={signInPath(locale, learnPath(locale))} className={buttonClass("primary", "lg")}>
        {labels.signIn}
      </Link>
    );
  }

  async function buy() {
    setError(null);
    setBusy(true);
    try {
      const response = await fetch(`/api/checkout?locale=${locale}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bundle: true }),
      });
      const result = (await response.json()) as { ok: boolean; url?: string; message?: string };
      if (!result.ok || !result.url) {
        // The route's own sentence when it has one (no keys on this
        // deployment), the generic one when it does not.
        setError(result.message ?? labels.error);
        setBusy(false);
        return;
      }
      // The gateway's page is another origin, which a soft transition cannot reach.
      window.location.assign(result.url);
    } catch {
      setError(labels.error);
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <button type="button" onClick={buy} disabled={busy} className={buttonClass("primary", "lg")}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : null}
        {busy ? labels.buying : labels.buy}
        {busy ? null : <ArrowRight className="size-3.5" />}
      </button>
      {error ? <p className="text-bad text-xs">{error}</p> : null}
    </div>
  );
}
