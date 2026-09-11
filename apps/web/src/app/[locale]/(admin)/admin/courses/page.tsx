import type { Metadata } from "next";
import { getIntl } from "@/lib/locale";
import { listAdminCourses } from "@/lib/queries/admin";
import { CourseTable } from "@/components/admin/course-table";

export const metadata: Metadata = { robots: { index: false } };

export default async function AdminCoursesPage() {
  const { locale, t } = await getIntl();
  const courses = await listAdminCourses();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-[26px]">{t.admin.courses.title}</h1>
      <CourseTable courses={courses} locale={locale} t={t} />
    </div>
  );
}
