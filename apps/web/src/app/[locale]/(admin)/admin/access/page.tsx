import type { Metadata } from "next";
import { Search } from "lucide-react";
import { accessLookupSchema } from "@jarvis/core";
import { getIntl } from "@/lib/locale";
import { findAccessCandidate, listGrantedPeople } from "@/lib/queries/admin";
import { AccessCard } from "@/components/admin/access-card";
import { GrantedList } from "@/components/admin/granted-list";
import { Input } from "@/components/ui/field";
import { buttonClass } from "@/components/ui/button";

export const metadata: Metadata = { robots: { index: false } };

/**
 * «Эрх олголт» — open the school for somebody without taking their money.
 *
 * The search is a **GET form**, not client state, so the found account lives in
 * the URL: the page survives a reload, the team can send each other a link to
 * the person they are discussing, and the back button does what it looks like
 * it does. It also means this page needs no client component to find anybody —
 * only the two buttons are interactive.
 *
 * Under it, everybody the team has already opened the school for. A row puts
 * that person in the search, so closing somebody's access is one tap from the
 * list rather than an address to retype.
 */
export default async function AdminAccessPage({
  searchParams,
}: PageProps<"/[locale]/admin/access">) {
  const { locale, t } = await getIntl();
  const copy = t.admin.access;

  const asked = (await searchParams).email;
  const typed = typeof asked === "string" ? asked : "";

  /*
   * Parsed rather than trusted: the address arrives from a query string, which
   * anybody can write anything into. A malformed one is simply not looked up —
   * there is nothing to tell the reader that the field will not tell them
   * better the moment they fix it.
   */
  const parsed = typed ? accessLookupSchema.safeParse({ email: typed }) : null;
  const [candidate, granted] = await Promise.all([
    parsed?.success ? findAccessCandidate(parsed.data.email) : null,
    listGrantedPeople(),
  ]);

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="font-display text-[26px]">{copy.title}</h1>
        <p className="text-ink-3 measure text-[13.5px]">{copy.deck}</p>
      </header>

      <form method="get" className="flex flex-wrap items-end gap-2">
        <div className="min-w-0 flex-1 sm:max-w-sm">
          <label htmlFor="email" className="text-ink-2 mb-1.5 block text-[13px]">
            {copy.email}
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={typed}
            placeholder={copy.emailPlaceholder}
            autoComplete="off"
          />
        </div>
        <button type="submit" className={buttonClass("primary", "md")}>
          <Search className="size-4" aria-hidden="true" />
          {copy.find}
        </button>
      </form>

      {parsed && !candidate ? (
        <p className="border-line panel text-ink-3 border-dashed px-4 py-10 text-center text-sm">
          {copy.notFound}
        </p>
      ) : null}

      {candidate ? <AccessCard candidate={candidate} locale={locale} t={t} /> : null}

      <GrantedList
        people={granted}
        selected={parsed?.success ? parsed.data.email : ""}
        locale={locale}
        t={t}
      />
    </div>
  );
}
