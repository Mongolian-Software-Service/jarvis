/**
 * Cyrillic → Latin, for the slug the editor proposes from a title.
 *
 * MNS 5217 flattened to ASCII: the standard's diacritics (ö, ü, š) are folded
 * away, because a slug's whole job is to survive an address bar, a QR code and
 * somebody typing it off a whiteboard.
 *
 * A **starting point**, never applied silently — the editor fills the field and
 * the writer edits it. Two different Mongolian titles can transliterate to the
 * same string, and the database's unique index is what catches that.
 */
const MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z",
  и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o", ө: "u", п: "p",
  р: "r", с: "s", т: "t", у: "u", ү: "u", ф: "f", х: "h", ц: "ts", ч: "ch",
  ш: "sh", щ: "sh", ъ: "", ы: "y", ь: "i", э: "e", ю: "yu", я: "ya",
};

export function slugify(input: string): string {
  const lower = input.toLowerCase().trim();
  let out = "";
  for (const char of lower) {
    if (char in MAP) out += MAP[char];
    else if (/[a-z0-9]/.test(char)) out += char;
    else out += "-";
  }
  return out
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80)
    .replace(/-$/, "");
}

/** The same rule the `public.slug` domain enforces in the database. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(value: string): boolean {
  return SLUG_PATTERN.test(value);
}
