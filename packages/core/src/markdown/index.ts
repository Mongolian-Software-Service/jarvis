/**
 * The Markdown a lesson body is allowed to use, parsed into blocks.
 *
 * Not a full CommonMark implementation and not trying to be. It is a *shared*
 * parser: the web renders these blocks to HTML and `apps/mobile` will render
 * the same blocks to React Native views, so a lesson reads the same on both.
 * A library that emits an HTML string could not do that — `dangerouslySetInner
 * HTML` has no counterpart on a phone, and a lesson body is content our own
 * editor writes, not something to hand to a renderer and hope.
 *
 * Supported, deliberately: `#`/`##`/`###` headings, paragraphs, `-` and `1.`
 * lists, fenced code with a language, `>` quotes, `---` rules, and inline
 * `**bold**`, `*italic*`, `` `code` `` and `[links](href)`.
 */

export * from "./types";
export * from "./block";
export * from "./inline";
export * from "./text";
