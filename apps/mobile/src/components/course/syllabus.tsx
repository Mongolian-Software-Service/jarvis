import { View } from "react-native";
import {
  formatDuration,
  kindLabel,
  space,
  type CourseDetail,
  type Locale,
  type Strings,
} from "@jarvis/core";
import { Markdown } from "@/components/markdown";
import { Card, Divider, Txt } from "@/components/ui";
import { LessonRow } from "./lesson-row";

/** «Сургалтын тухай» and the numbered list under it. */
export function CourseSyllabus({
  course,
  locale,
  t,
  access,
}: {
  course: CourseDetail;
  locale: Locale;
  t: Strings;
  access: boolean;
}) {
  return (
    <>
        {course.description ? (
          <View style={{ gap: space.sm }}>
            <Txt variant="title">{t.learn.course.about}</Txt>
            <Markdown source={course.description} />
            {course.descriptionIsFallback ? (
              <Txt variant="micro" tone="dim">
                {t.learn.fallbackNotice}
              </Txt>
            ) : null}
          </View>
        ) : null}

        <View style={{ gap: space.md }}>
          <Txt variant="title">{t.learn.course.syllabus}</Txt>
          {course.modules.map((section, index) => (
            <View key={section.id} style={{ gap: space.sm }}>
              <Txt variant="micro" tone="dim">
                {String(index + 1).padStart(2, "0")} · {section.title}
              </Txt>
              <Card padded={false}>
                {section.lessons.map((lesson, position) => (
                  <View key={lesson.id}>
                    {position > 0 ? <Divider /> : null}
                    <LessonRow
                      lesson={lesson}
                      courseSlug={course.slug}
                      open={access || lesson.isPreview}
                      previewLabel={t.learn.course.preview}
                      kindText={`${kindLabel(lesson.kind, locale)}${lesson.minutes > 0 ? ` · ${formatDuration(lesson.minutes, locale)}` : ""}`}
                    />
                  </View>
                ))}
              </Card>
            </View>
          ))}
        </View>
    </>
  );
}
