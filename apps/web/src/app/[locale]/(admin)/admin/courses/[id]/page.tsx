import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getIntl } from "@/lib/locale";
import { getAdminCourse } from "@/lib/queries/admin";
import { CourseForm } from "@/components/admin/course-form";
import { ModuleManager } from "@/components/admin/module-manager";

export const metadata: Metadata = { robots: { index: false } };

/** Course settings above, syllabus below — one screen, because they are one job. */
export default async function EditCoursePage({ params }: PageProps<"/[locale]/admin/courses/[id]">) {
  const { id } = await params;
  const { locale, t } = await getIntl();

  const course = await getAdminCourse(id);
  if (!course) notFound();

  return (
    <div className="space-y-10">
      <CourseForm course={course} t={t} locale={locale} />
      <ModuleManager course={course} locale={locale} t={t} />
    </div>
  );
}
