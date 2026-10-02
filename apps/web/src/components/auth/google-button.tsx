"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { GOOGLE_MARK } from "@jarvis/core";
import { signInWithGoogle } from "@/lib/actions/google";
import { buttonClass } from "@/components/ui/button";

/** The mark, drawn from the shared path data so sign-in and sign-up cannot
 *  end up showing two different logos. */
function GoogleMark() {
  return (
    <svg viewBox={GOOGLE_MARK.viewBox} aria-hidden="true" className="size-4 shrink-0">
      {GOOGLE_MARK.paths.map((path) => (
        <path key={path.fill} fill={path.fill} d={path.d} />
      ))}
    </svg>
  );
}

/**
 * One button for both doors.
 *
 * Google sign-in *is* sign-up when the address is new — Supabase creates the
 * account and the profiles trigger fills the name and picture from the claims.
 * So the copy says "continue with", and this same component sits on the
 * sign-in page and the sign-up page unchanged.
 */
export function GoogleButton({
  label,
  opening,
  next,
}: {
  label: string;
  opening: string;
  next?: string;
}) {
  return (
    <form action={signInWithGoogle}>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <Submit label={label} opening={opening} />
    </form>
  );
}

function Submit({ label, opening }: { label: string; opening: string }) {
  // `useFormStatus` only reports the form it is rendered inside, which is why
  // this is a child component rather than a flag on the one above.
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={buttonClass("secondary", "lg", "w-full")}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <GoogleMark />}
      {pending ? opening : label}
    </button>
  );
}

/** A rule with a word in it. Used only to separate Google from the email form. */
export function OrDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3" role="separator" aria-label={label}>
      <span className="h-px flex-1 bg-line" />
      <span className="text-xs text-ink-3">{label}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
