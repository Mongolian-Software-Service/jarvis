"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { adminPath, coursePath, levelLabel, type Locale, type Strings } from "@jarvis/core";
import { deleteCourse } from "@/lib/actions/admin";
import { Input } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "./delete-button";
import type { AdminCourseRow } from "@/lib/queries/admin";

/**
 * The whole list, filtered in the browser.
 *
 * A school has tens of courses, not thousands, so the list is capped by what a
 * page can hold rather than by a query — and typing then filters instantly with
 * no round trip. When that stops being true this gains a server search and the
 * shape does not change.
 */
export function CourseTable({
  courses,
  locale,
  t,
}: {
  courses: AdminCourseRow[];
  locale: Locale;
  t: Strings;
}) {
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return courses;
    return courses.filter((course) =>
      [course.title, course.slug, course.topic].some((value) =>
        value.toLowerCase().includes(term),
      ),
    );
  }, [courses, query]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-3" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.admin.courses.search}
          className="pl-9"
          aria-label={t.admin.courses.search}
        />
      </div>

      {rows.length === 0 ? (
        <p className="panel border-dashed px-4 py-10 text-center text-sm text-ink-3">
          {t.admin.courses.empty}
        </p>
      ) : (
        <div className="panel divide-y divide-line overflow-hidden">
          {rows.map((course) => (
            <div key={course.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="min-w-48 flex-1">
                <Link
                  href={adminPath(locale, `/courses/${course.id}`)}
                  className="block truncate font-medium hover:text-accent"
                >
                  {course.title}
                </Link>
                <span className="block truncate font-mono text-xs text-ink-3">/{course.slug}</span>
              </div>

              <span className="hidden text-xs text-ink-3 sm:block">
                {levelLabel(course.level, locale)}
              </span>
              <span className="text-xs text-ink-3 tabular">
                {course.lessons} {t.admin.courses.lessons}
              </span>
              <span className="text-xs text-ink-3 tabular">
                {course.students} {t.admin.nav.students.toLowerCase()}
              </span>
              {/* Not a price — there is one of those and it is not per course
                  (§1). What the console needs to see is which side of the
                  bundle a course sits on. */}
              <span className="w-24 text-right text-xs text-ink-3">
                {course.isFree ? t.admin.courses.accessFree : t.admin.courses.accessBundle}
              </span>

              <Badge tone={course.published ? "ok" : "neutral"}>
                {course.published ? t.admin.courses.published : t.admin.courses.draft}
              </Badge>

              <Link
                href={coursePath(locale, course.slug)}
                className="text-xs text-ink-3 hover:text-ink"
              >
                {t.admin.nav.viewSite}
              </Link>

              <DeleteButton
                onDelete={() => deleteCourse(course.id)}
                labels={{
                  delete: t.actions.delete,
                  confirm: t.actions.confirmDelete,
                  cancel: t.actions.cancel,
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
