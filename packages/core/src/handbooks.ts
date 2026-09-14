/**
 * The printed companion to a course.
 *
 * A handbook is a PDF in `apps/web/public/handbook/`, built from
 * `docs/handbook/*.html` by `scripts/build-handbook.mjs`. Not every course has
 * one — this map is the list of those that do, keyed by course slug, so the
 * course page can ask and get nothing rather than carrying a slug in an `if`.
 *
 * `pages` and `sizeKb` are **written by the build script**, which reads them
 * back out of the PDF it just produced. They are in the file rather than
 * measured at request time because a server component that stats a file on
 * every render is paying for a number that changes twice a year.
 */
export type Handbook = {
  /** Served path. Public, and deliberately not behind the paywall. */
  file: string;
  pages: number;
  sizeKb: number;
};

export const HANDBOOKS: Record<string, Handbook> = {
  tanilcuulga: { file: "/handbook/tsstark-academy-tanilcuulga.pdf", pages: 22, sizeKb: 355 },
  "code-suuri": { file: "/handbook/tsstark-academy-code-suuri.pdf", pages: 10, sizeKb: 177 },
};

export function handbookFor(slug: string): Handbook | null {
  return HANDBOOKS[slug] ?? null;
}
