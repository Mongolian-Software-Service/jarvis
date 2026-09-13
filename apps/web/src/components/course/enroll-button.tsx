"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { coursePlayerPath, signInPath, type Locale } from "@jarvis/core";
import { enrollFree } from "@/lib/actions/enroll";
import { buttonClass } from "@/components/ui/button";

/**
 * The one control that turns a visitor into a student.
 *
 * Four states, because there are four situations and collapsing any two of them
 * produces a button that lies: signed out, already enrolled, free, and paid.
 *
 * "Paid" no longer means this course. A course is not sold on its own (§1), so
 * the fourth state buys the bundle and is labelled as buying all of it — the
 * panel around this button says the same thing, and a button that said "buy
 * this course" while charging for six would be the lie.
 *
 * Neither path sends a price. The free one calls a server action and the
 * database decides; the paid one posts `{ bundle: true }` and the amount comes
 * from one constant on the server. A price that arrives with the request is a
 * price the buyer chose.
 */
export function EnrollButton({
  courseId,
  courseSlug,
  locale,
  free,
  enrolled,
  signedIn,
  labels,
}: {
  courseId: string;
  courseSlug: string;
  locale: Locale;
  free: boolean;
  enrolled: boolean;
  signedIn: boolean;
  labels: {
    buy: string;
    buying: string;
    startFree: string;
    continue: string;
    signIn: string;
    error: string;
  };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (enrolled) {
    return (
      <Link
        href={coursePlayerPath(locale, courseSlug)}
        className={buttonClass("primary", "lg", "w-full")}
      >
        {labels.continue}
        <ArrowRight className="size-4" />
      </Link>
    );
  }

  if (!signedIn) {
    return (
      <Link
        href={signInPath(locale, `/${locale}/courses/${courseSlug}`)}
        className={buttonClass("primary", "lg", "w-full")}
      >
        {labels.signIn}
      </Link>
    );
  }

  if (free) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          disabled={pending}
          className={buttonClass("primary", "lg", "w-full")}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const result = await enrollFree(courseId);
              if (result.ok) router.push(coursePlayerPath(locale, courseSlug));
              else setError(result.error);
            });
          }}
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {labels.startFree}
        </button>
        {error ? <p className="text-xs text-bad">{error}</p> : null}
      </div>
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
      const result = (await response.json()) as { ok: boolean; url?: string };
      if (!result.ok || !result.url) {
        setError(labels.error);
        setBusy(false);
        return;
      }
      /*
       * `location.assign`, not `router.push`: the gateway's payment page is
       * another origin, and the mock path returns a URL on this one. One line
       * handles both, and neither wants a client-side transition.
       */
      window.location.assign(result.url);
    } catch {
      setError(labels.error);
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={buy}
        disabled={busy}
        className={buttonClass("primary", "lg", "w-full")}
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : null}
        {busy ? labels.buying : labels.buy}
      </button>
      {error ? <p className="text-xs text-bad">{error}</p> : null}
    </div>
  );
}
