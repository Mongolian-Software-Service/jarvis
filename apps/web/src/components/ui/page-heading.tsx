/**
 * The head of a document-shaped page: a title, the line under it, a hairline.
 *
 * Shared by the two legal pages and every category of «Тохиргоо», which now
 * sit side by side in one column — a heading that changed size between
 * «Хувийн мэдээлэл» and «Нууцлалын бодлого» would make the switch look like
 * leaving the section rather than moving inside it.
 *
 * Leading is named on the `h1` (§4): Tailwind's text sizes carry their own, and
 * a two-line Mongolian title would otherwise be set solid.
 */
export function PageHeading({
  title,
  deck,
  note,
}: {
  title: string;
  deck: string;
  /** Small print under the deck — a legal page's «Сүүлд шинэчилсэн». */
  note?: string;
}) {
  return (
    <header className="border-line border-b pb-8">
      <h1 className="font-display text-[30px] leading-[1.15] sm:text-[38px]">{title}</h1>
      <p className="text-ink-3 measure mt-3 text-[15px]">{deck}</p>
      {note ? <p className="text-ink-3 mt-4 text-xs">{note}</p> : null}
    </header>
  );
}
