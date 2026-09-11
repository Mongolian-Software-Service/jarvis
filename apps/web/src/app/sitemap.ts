import type { MetadataRoute } from "next";
import { LOCALES } from "@jarvis/core";
import { listCourseSlugs } from "@/lib/queries/courses";

const base = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

/**
 * Published courses, in both languages, with each one naming the other.
 *
 * An English course page exists for every Mongolian one — the fallback rule
 * means it renders the Mongolian text rather than 404ing — so both belong here,
 * cross-linked by `alternates`.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await listCourseSlugs();
  const now = new Date();

  const paths = [
    "",
    "/courses",
    "/about",
    "/contact",
    ...slugs.map((slug) => `/courses/${slug}`),
  ];

  return paths.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: `${base}/${locale}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((code) => [code, `${base}/${code}${path}`]),
        ),
      },
    })),
  );
}
