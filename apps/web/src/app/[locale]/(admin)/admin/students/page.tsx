import type { Metadata } from "next";
import { getIntl } from "@/lib/locale";
import { listCourseOptions, listStudents } from "@/lib/queries/admin";
import { StudentTable } from "@/components/admin/student-table";

export const metadata: Metadata = { robots: { index: false } };

export default async function AdminStudentsPage() {
  const { locale, t } = await getIntl();
  const [students, courses] = await Promise.all([listStudents(locale), listCourseOptions()]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-[26px]">{t.admin.students.title}</h1>
      <StudentTable students={students} courses={courses} locale={locale} t={t} />
    </div>
  );
}
