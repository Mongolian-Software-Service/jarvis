"use client";

import { useMemo, useState } from "react";
import { Search, ShieldCheck, User } from "lucide-react";
import { formatDate, type Locale, type Strings } from "@jarvis/core";
import { Input } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import type { AdminStudent } from "@/lib/queries/admin";
import { StudentDialog } from "./student-dialog";

/**
 * Who is enrolled. One row each, and the row is the button.
 *
 * The actions used to sit **in** the row — a role toggle, and a grant form that
 * unfolded underneath it. They have moved into the dialog, and not only for
 * tidiness: a row that is itself a `<button>` cannot contain buttons. Nested
 * interactive elements are invalid HTML, and a screen reader announces the
 * whole row as one control with three names.
 *
 * So the row identifies, and the dialog acts.
 */
export function StudentTable({
  students,
  courses,
  locale,
  t,
}: {
  students: AdminStudent[];
  courses: { id: string; title: string }[];
  locale: Locale;
  t: Strings;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return students;
    return students.filter((student) =>
      [student.name ?? "", student.email ?? "", student.phone ?? ""].some((value) =>
        value.toLowerCase().includes(term),
      ),
    );
  }, [students, query]);

  /*
   * Looked up by id rather than held as an object: the list is replaced on
   * every `router.refresh()` after an action, and a stale copy pinned in state
   * would leave the dialog showing the courses somebody had a moment ago.
   */
  const current = open ? (students.find((student) => student.id === open) ?? null) : null;

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="text-ink-3 absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.admin.students.search}
          className="pl-9"
          aria-label={t.admin.students.search}
        />
      </div>

      {rows.length === 0 ? (
        <p className="panel text-ink-3 border-dashed px-4 py-10 text-center text-sm">
          {t.admin.students.empty}
        </p>
      ) : (
        <div className="panel divide-line divide-y overflow-hidden">
          {rows.map((student) => (
            <button
              key={student.id}
              type="button"
              onClick={() => setOpen(student.id)}
              className="hover:bg-panel-2 flex w-full items-center gap-3 px-4 py-3 text-left transition-colors"
            >
              <span className="bg-panel-2 text-ink-3 grid size-8 shrink-0 place-items-center rounded-full">
                {student.role === "admin" ? (
                  <ShieldCheck className="text-accent size-4" />
                ) : (
                  <User className="size-4" />
                )}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{student.name ?? "—"}</span>
                <span className="text-ink-3 block truncate text-xs">{student.email}</span>
              </span>

              <span className="text-ink-3 tabular hidden text-xs sm:block">
                {formatDate(student.joined, locale)}
              </span>
              <span className="text-ink-3 tabular shrink-0 text-xs">
                {student.held.length} {t.admin.nav.courses.toLowerCase()}
              </span>

              {student.role === "admin" ? <Badge tone="accent">admin</Badge> : null}
            </button>
          ))}
        </div>
      )}

      {current ? (
        <StudentDialog
          student={current}
          courses={courses}
          locale={locale}
          t={t}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </div>
  );
}
