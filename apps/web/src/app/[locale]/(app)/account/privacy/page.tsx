import type { Metadata } from "next";
import { getIntl } from "@/lib/locale";
import { LegalDocument } from "@/components/site/legal-page";

/**
 * The privacy policy, read from inside «Тохиргоо» — the place a student goes
 * to ask what the school keeps about them. Same table as the public
 * `/privacy`; not indexed, for the reason the terms page gives.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getIntl();
  return { title: t.legal.privacy.title, robots: { index: false } };
}

export default async function SettingsPrivacyPage() {
  const { t } = await getIntl();
  return <LegalDocument {...t.legal.privacy} />;
}
