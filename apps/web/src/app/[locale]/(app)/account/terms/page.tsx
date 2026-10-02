import type { Metadata } from "next";
import { getIntl } from "@/lib/locale";
import { LegalDocument } from "@/components/site/legal-page";

/**
 * The terms, read from inside «Тохиргоо».
 *
 * The same string table as the public `/terms`, so the two cannot say
 * different things. Not indexed: the public page is the one a search engine
 * should find, and this URL answers only to somebody signed in.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getIntl();
  return { title: t.legal.terms.title, robots: { index: false } };
}

export default async function SettingsTermsPage() {
  const { t } = await getIntl();
  return <LegalDocument {...t.legal.terms} />;
}
