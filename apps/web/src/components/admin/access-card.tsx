"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, KeyRound, Loader2, Lock, Mail, Phone, User } from "lucide-react";
import { fmt, formatDate, type Locale, type Strings } from "@jarvis/core";
import { closeGrantedCourses, openAllCourses } from "@/lib/actions/admin";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import type { AccessCandidate } from "@/lib/queries/admin";

/**
 * The account the team found, and the two things they can do to it.
 *
 * It shows the name, phone and address together before either button, and that
 * is the point of the screen rather than decoration: the team is handed an
 * address by a person, and a school opened for the wrong `bat@gmail.com` is a
 * refund and an apology. Confirming who this is costs one glance.
 */
export function AccessCard({
  candidate,
  locale,
  t,
}: {
  candidate: AccessCandidate;
  locale: Locale;
  t: Strings;
}) {
  const copy = t.admin.access;
  const router = useRouter();
  const [pending, start] = useTransition();
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  const name = [candidate.lastName, candidate.firstName].filter(Boolean).join(" ");

  function run(action: () => Promise<{ ok: boolean; error?: string }>, done: string) {
    setNote(null);
    start(async () => {
      const result = await action();
      setNote(
        result.ok
          ? { ok: true, text: done }
          : { ok: false, text: result.error ?? t.admin.errors.saveFailed },
      );
      // The card prints how many courses are open; that number has just moved.
      if (result.ok) router.refresh();
    });
  }

  return (
    <section className="panel space-y-5 p-5">
      <p className="kicker">{copy.confirmTitle}</p>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <dl className="min-w-0 space-y-2 text-[13.5px]">
          <Line icon={User} label={copy.confirmTitle} value={name || "—"} strong />
          <Line icon={Mail} label={copy.email} value={candidate.email ?? "—"} />
          <Line icon={Phone} label={copy.phone} value={candidate.phone ?? "—"} />
          <Line icon={Check} label={copy.joined} value={formatDate(candidate.createdAt, locale)} />
        </dl>

        <Badge tone={candidate.granted > 0 ? "ok" : "neutral"}>
          {candidate.granted > 0 ? fmt(copy.granted, { count: candidate.granted }) : copy.none}
        </Badge>
      </div>

      {note ? (
        <p
          className={
            note.ok
              ? "border-ok/30 bg-ok-soft text-ok rounded-md border px-3 py-2 text-sm"
              : "border-bad/30 bg-bad-soft text-bad rounded-md border px-3 py-2 text-sm"
          }
        >
          {note.text}
        </p>
      ) : null}

      <div className="hairline flex flex-wrap items-center gap-2 pt-4">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            run(
              () => openAllCourses(candidate.id),
              fmt(copy.opened, { name: name || candidate.email || "" }),
            )
          }
          className={buttonClass("primary", "md")}
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
          {pending ? copy.opening : copy.open}
        </button>

        {candidate.granted > 0 ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => closeGrantedCourses(candidate.id), copy.closed)}
            className={buttonClass("ghost", "md")}
          >
            <Lock className="size-4" />
            {pending ? copy.closing : copy.close}
          </button>
        ) : null}
      </div>

      <p className="text-ink-3 text-xs">{copy.closeNote}</p>
    </section>
  );
}

function Line({
  icon: Icon,
  label,
  value,
  strong,
}: {
  icon: typeof User;
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="text-ink-3 size-4 shrink-0" aria-hidden="true" />
      <dt className="sr-only">{label}</dt>
      <dd className={strong ? "text-ink font-medium" : "text-ink-2"}>{value}</dd>
    </div>
  );
}
