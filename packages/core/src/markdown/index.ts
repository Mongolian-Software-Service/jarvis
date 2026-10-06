/**
 * The Markdown a lesson body is allowed to use, parsed into blocks.
 *
 * Not a full CommonMark implementation and not trying to be. Every library in
 * this space emits an HTML string, and an HTML string has to be injected with
 * `dangerouslySetInnerHTML` — a hole opened on every lesson page to render
 * something our own editor wrote. A typed block tree is walked by a component
 * instead, so there is no such call anywhere in this codebase.
 *
 * Supported, deliberately: `#`/`##`/`###` headings, paragraphs, `-` and `1.`
 * lists, fenced code with a language, `>` quotes, `---` rules, and inline
 * `**bold**`, `*italic*`, `` `code` `` and `[links](href)`.
 *
 * One fence is not code: ```diagram parses to a `diagram` block, one step per
 * line, `Label | the note under it`. It is how a lesson draws a picture without
 * carrying one — see `MdStep` in `./types`.
 *
 * One quote is not a quote: `> [!IMPORTANT]` on its own first line makes the
 * rest a `notice` block, drawn in the warning colour rather than as a prompt.
 */

export * from "./types";
export * from "./block";
export * from "./inline";
export * from "./text";
