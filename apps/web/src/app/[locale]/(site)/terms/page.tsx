import type { Metadata } from "next";
import { getIntl } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/site/legal-page";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getIntl();
  return pageMetadata({
    locale,
    title: t.legal.terms.title,
    description: t.legal.terms.deck,
    path: "/terms",
  });
}

export default async function TermsPage() {
  const { t } = await getIntl();
  const copy = t.legal.terms;
  return (
    <LegalPage
      title={copy.title}
      deck={copy.deck}
      updated={copy.updated}
      sections={copy.sections}
    />
  );
}
