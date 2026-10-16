"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Lock, Mail, Phone, User } from "lucide-react";
import { GRANT_KINDS, fmt, formatDate, type GrantKind, type Locale, type Strings } from "@jarvis/core";
import { closeGrantedCourses, openAllCourses } from "@/lib/actions/admin";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import type { AccessCandidate } from "@/lib/queries/admin";
import { GRANT_KIND_ICON, GrantKindBadge } from "./grant-kind-badge";

/**
 * The account the team found, and the two things they can do to it.
 *
 * It shows the name, phone and address together before either button, and that
 * is the point of the screen rather than decoration: the team is handed an
 * address by a person, and a school opened for the wrong `bat@gmail.com` is a
 * refund and an apology. Confirming who this is costs one glance.
 *
 * Opening is a choice of two, VIP or Бэлэг, and each is its own button rather
 * than a picker and a third button to confirm it: the choice *is* the press.
 * Neither is the primary — a default would be the kind nobody chose. For
 * somebody who already holds a grant, their kind is shown pressed and the other
 * button switches them to it.
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
  const [busy, setBusy] = useState<GrantKind | "close" | null>(null);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  const name = [candidate.lastName, candidate.firstName].filter(Boolean).join(" ");
  const held = candidate.granted > 0 ? candidate.kind : null;

  function run(
    key: GrantKind | "close",
    action: () => Promise<{ ok: boolean; error?: string }>,
    done: string,
  ) {
    setNote(null);
    setBusy(key);
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

        <span className="flex flex-wrap items-center gap-1.5">
          {held ? <GrantKindBadge kind={held} t={t} /> : null}
          <Badge tone={candidate.granted > 0 ? "ok" : "neutral"}>
            {candidate.granted > 0 ? fmt(copy.granted, { count: candidate.granted }) : copy.none}
          </Badge>
        </span>
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

      <div className="hairline space-y-3 pt-4">
        <p className="text-ink-2 text-[13px]">{copy.kindPrompt}</p>
        <div className="flex flex-wrap items-center gap-2">
          {GRANT_KINDS.map((kind) => {
            const Icon = held === kind ? Check : GRANT_KIND_ICON[kind];
            return (
              <button
                key={kind}
                type="button"
                disabled={pending || held === kind}
                aria-pressed={held === kind}
                onClick={() =>
                  run(
                    kind,
                    () => openAllCourses(candidate.id, kind),
                    fmt(copy.opened, { name: name || candidate.email || "", kind: copy.kinds[kind] }),
                  )
                }
                className={buttonClass("secondary", "md")}
              >
                {pending && busy === kind ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Icon className="size-4" />
                )}
                {pending && busy === kind
                  ? copy.opening
                  : held === kind
                    ? copy.kinds[kind]
                    : held
                      ? copy.switchTo[kind]
                      : copy.grantAs[kind]}
              </button>
            );
          })}

          {candidate.granted > 0 ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => run("close", () => closeGrantedCourses(candidate.id), copy.closed)}
              className={buttonClass("ghost", "md")}
            >
              <Lock className="size-4" />
              {pending && busy === "close" ? copy.closing : copy.close}
            </button>
          ) : null}
        </div>
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
