"use client";

import { useEffect, useRef } from "react";
import { Mail, Phone, ShieldCheck, User, X } from "lucide-react";
import { formatDate, type Locale, type Strings } from "@jarvis/core";
import { Badge } from "@/components/ui/badge";
import type { AdminStudent } from "@/lib/queries/admin";
import { GrantForm, RoleButton } from "./student-actions";

/**
 * One student, in full, and everything the team can do to them.
 *
 * The list behind this shows who somebody is; this shows what is true of them —
 * the phone nobody could see before, which of the two names is which, and what
 * they actually hold rather than how many. `source` is printed beside each
 * course on purpose: «Худалдан авсан» and «Гараар нээсэн» are the difference
 * between a course you may close and one you may not (§6.7).
 */
export function StudentDialog({
  student,
  courses,
  locale,
  t,
  onClose,
}: {
  student: AdminStudent;
  courses: { id: string; title: string }[];
  locale: Locale;
  t: Strings;
  onClose: () => void;
}) {
  const copy = t.admin.students;
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const name = [student.lastName, student.firstName].filter(Boolean).join(" ") || student.name;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={name ?? copy.title}
      className="fixed inset-0 z-50 grid place-items-center p-5"
    >
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        style={{ background: "rgba(8,9,10,.72)", backdropFilter: "blur(6px)" }}
      />

      <div className="panel-raised relative flex max-h-[85dvh] w-full max-w-lg flex-col overflow-y-auto p-6 sm:p-7">
        <header className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="bg-panel-2 text-ink-3 grid size-10 shrink-0 place-items-center rounded-full">
              {student.role === "admin" ? (
                <ShieldCheck className="text-accent size-5" />
              ) : (
                <User className="size-5" />
              )}
            </span>
            <div className="min-w-0">
              <h2 className="font-display truncate text-[19px] leading-[1.2]">{name ?? "—"}</h2>
              <p className="text-ink-3 mt-0.5 text-xs">
                {copy.joined} · {formatDate(student.joined, locale)}
              </p>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t.actions.close}
            className="text-ink-3 hover:text-ink hover:bg-panel-2 -m-1.5 shrink-0 rounded-md p-1.5 transition-colors"
          >
            <X className="size-4" />
          </button>
        </header>

        <dl className="mt-5 space-y-2 text-[13.5px]">
          <Row icon={Mail} label={copy.email} value={student.email ?? "—"} />
          <Row icon={Phone} label={copy.phone} value={student.phone ?? "—"} />
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="text-ink-3 size-4 shrink-0" aria-hidden="true" />
            <dt className="sr-only">{copy.role}</dt>
            <dd>
              <Badge tone={student.role === "admin" ? "accent" : "neutral"}>{student.role}</Badge>
            </dd>
          </div>
        </dl>

        <section className="mt-6">
          <p className="kicker">{copy.heldTitle}</p>
          {student.held.length === 0 ? (
            <p className="text-ink-3 mt-2 text-[13px]">{copy.heldEmpty}</p>
          ) : (
            <ul className="divide-line border-line mt-2 divide-y rounded-md border">
              {student.held.map((held) => (
                <li
                  key={held.courseId}
                  className="flex items-center justify-between gap-3 px-3 py-2 text-[13px]"
                >
                  <span className="min-w-0 truncate">{held.title}</span>
                  <span className="text-ink-3 shrink-0 text-xs">{copy.source[held.source]}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="hairline mt-6 space-y-4 pt-4">
          <RoleButton student={student} t={t} />
          <GrantForm studentId={student.id} courses={courses} t={t} />
        </div>
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="text-ink-3 size-4 shrink-0" aria-hidden="true" />
      <dt className="sr-only">{label}</dt>
      <dd className="text-ink-2 min-w-0 truncate">{value}</dd>
    </div>
  );
}
