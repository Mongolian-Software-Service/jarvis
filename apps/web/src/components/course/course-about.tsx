import { type CourseDetail, type Strings } from "@jarvis/core";
import { Markdown } from "@/components/lesson/markdown";

/** «Сургалтын тухай» — the description, and nothing else. */
export function CourseAbout({
  course,
  t,
  copy,
}: {
  course: CourseDetail;
  t: Strings;
  copy: { copy: string; copied: string };
}) {
  return (
        <section>
          <h2 className="font-display mb-4 text-[20px]">{t.learn.course.about}</h2>
          {course.description ? (
            <Markdown
              source={course.description}
              copyLabels={copy}
              /* Mongolian shown inside the English edition has to say which
                 language it is, or a screen reader pronounces Cyrillic with
                 English rules. */
              lang={course.descriptionIsFallback ? "mn" : undefined}
            />
          ) : (
            <p className="text-ink-3">{course.summary}</p>
          )}
          {course.descriptionIsFallback ? (
            <p className="mt-4 rounded-md border border-line bg-panel-2 px-4 py-3 text-xs text-ink-3">
              {t.learn.fallbackNotice}
            </p>
          ) : null}
        </section>
  );
}
