import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { adminPath } from "@jarvis/core";
import { getIntl } from "@/lib/locale";
import { getAdminLesson } from "@/lib/queries/admin";
import { LessonForm } from "@/components/admin/lesson-form";

export const metadata: Metadata = { robots: { index: false } };

export default async function EditLessonPage({ params }: PageProps<"/[locale]/admin/lessons/[id]">) {
  const { id } = await params;
  const { locale, t } = await getIntl();

  const lesson = await getAdminLesson(id);
  if (!lesson) notFound();

  return (
    <div className="space-y-5">
      <Link
        href={adminPath(locale, `/courses/${lesson.course_id}`)}
        className="inline-flex items-center gap-1.5 text-sm text-ink-3 hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        {lesson.courseTitle}
      </Link>
      <LessonForm lesson={lesson} modules={lesson.modules} t={t} />
    </div>
  );
}
