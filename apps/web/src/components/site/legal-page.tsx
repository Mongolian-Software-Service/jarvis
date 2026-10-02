import { PageHeading } from "@/components/ui/page-heading";

type LegalCopy = {
  title: string;
  deck: string;
  updated: string;
  sections: readonly { readonly heading: string; readonly body: string }[];
};

/**
 * Both legal pages, from one component.
 *
 * Terms and privacy have the same shape — a title, a date, and a numbered run
 * of headed sections — so they are one layout fed two string tables rather than
 * two pages that will drift apart the first time either is edited.
 *
 * Prose here keeps `.measure` (§3): these are the two screens on the site where
 * a long line genuinely is harder to read, and nobody is skimming them for
 * pleasure. The numbers down the left are so somebody can say "point 5".
 *
 * The document is drawn in two places. `LegalPage` is the public URL, with its
 * own column, for a stranger reading before they sign up — the footer links
 * there. A student reads the same `LegalDocument` inside
 * «Тохиргоо», whose layout already owns the column, which is why the document
 * itself carries no `.shell` (§3: two nested double the gutter).
 */
export function LegalDocument({ title, deck, updated, sections }: LegalCopy) {
  return (
    <article>
      <PageHeading title={title} deck={deck} note={updated} />

      <ol className="mt-10 space-y-8">
        {sections.map((section, index) => (
          <li key={section.heading} className="flex gap-4 sm:gap-6">
            <span
              aria-hidden="true"
              className="text-ink-3 tabular w-6 shrink-0 pt-1 text-right text-[13px]"
            >
              {index + 1}
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-[17px] leading-[1.3]">{section.heading}</h2>
              <p className="text-ink-2 measure mt-2 text-[14px] leading-[1.75]">{section.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </article>
  );
}

export function LegalPage(copy: LegalCopy) {
  return (
    <div className="shell py-12 sm:py-16">
      <LegalDocument {...copy} />
    </div>
  );
}
