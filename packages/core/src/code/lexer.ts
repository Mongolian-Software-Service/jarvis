/**
 * The scanner itself — one pass, left to right, no parse tree.
 *
 * It does not know what a type is, only what one looks like. That is the right
 * trade for snippets of ten to forty lines, and it is why this costs nothing to
 * run inside a request.
 */
import type { CodeLine, CodeToken, LangSpec, TokenKind } from "./types";

/** Tokens may contain newlines (a block comment, a template string). Lines cannot. */
export function toLines(tokens: readonly CodeToken[]): CodeLine[] {
  const lines: CodeLine[] = [[]];
  for (const token of tokens) {
    const parts = token.text.split("\n");
    for (let i = 0; i < parts.length; i++) {
      if (i > 0) lines.push([]);
      const text = parts[i] ?? "";
      if (text === "") continue;
      lines[lines.length - 1]!.push({ text, kind: token.kind });
    }
  }
  return lines;
}

const IDENTIFIER = /[A-Za-z_$@][\w$-]*/y;
const NUMBER = /\d[\d_]*(\.\d+)?([eE][+-]?\d+)?[a-z%]*/y;
const SPACE = /\s+/y;

export function scan(source: string, spec: LangSpec): CodeToken[] {
  const tokens: CodeToken[] = [];
  const push = (text: string, kind: TokenKind) => {
    if (!text) return;
    const last = tokens[tokens.length - 1];
    if (last && last.kind === kind) last.text += text;
    else tokens.push({ text, kind });
  };

  let i = 0;
  while (i < source.length) {
    const rest = source.slice(i);

    // Whitespace
    SPACE.lastIndex = i;
    const space = SPACE.exec(source);
    if (space && space.index === i) {
      push(space[0], "plain");
      i += space[0].length;
      continue;
    }

    // Comments — before everything else, since a comment may hold any of it.
    const line = spec.lineComment.find((token) => rest.startsWith(token));
    if (line) {
      const end = source.indexOf("\n", i);
      const stop = end === -1 ? source.length : end;
      push(source.slice(i, stop), "comment");
      i = stop;
      continue;
    }
    const block = spec.blockComment.find(([open]) => rest.startsWith(open));
    if (block) {
      const close = source.indexOf(block[1], i + block[0].length);
      const stop = close === -1 ? source.length : close + block[1].length;
      push(source.slice(i, stop), "comment");
      i = stop;
      continue;
    }

    // Strings. Long quotes first: `"""` starts with `"`.
    const long = spec.longQuotes?.find((quote) => rest.startsWith(quote));
    if (long) {
      const close = source.indexOf(long, i + long.length);
      const stop = close === -1 ? source.length : close + long.length;
      push(source.slice(i, stop), "string");
      i = stop;
      continue;
    }
    const quote = spec.quotes.find((q) => rest.startsWith(q));
    if (quote) {
      let j = i + quote.length;
      while (j < source.length) {
        if (source[j] === "\\") {
          j += 2;
          continue;
        }
        if (source.startsWith(quote, j)) {
          j += quote.length;
          break;
        }
        // An unterminated string ends at the line break rather than eating the
        // rest of the file — half-typed code in an editor preview still reads.
        if (source[j] === "\n" && quote !== "`") break;
        j++;
      }
      push(source.slice(i, j), "string");
      i = j;
      continue;
    }

    // Numbers
    NUMBER.lastIndex = i;
    const number = NUMBER.exec(source);
    if (number && number.index === i && /^\d/.test(number[0])) {
      push(number[0], "number");
      i += number[0].length;
      continue;
    }

    // Words
    IDENTIFIER.lastIndex = i;
    const word = IDENTIFIER.exec(source);
    if (word && word.index === i) {
      const text = word[0];
      const after = source.slice(i + text.length);
      let kind: TokenKind = "plain";
      if (spec.keywords.has(text) || spec.keywords.has(text.toLowerCase())) kind = "keyword";
      else if (/^\s*\(/.test(after)) kind = "function";
      else if (spec.attrBeforeColon && /^\s*:/.test(after)) kind = "attr";
      push(text, kind);
      i += text.length;
      continue;
    }

    push(source[i] ?? "", "punct");
    i++;
  }

  return tokens;
}

/** HTML and friends: tags, attribute names, quoted values, comments. */
export function scanMarkup(source: string): CodeToken[] {
  const tokens: CodeToken[] = [];
  const push = (text: string, kind: TokenKind) => {
    if (text) tokens.push({ text, kind });
  };

  let i = 0;
  while (i < source.length) {
    if (source.startsWith("<!--", i)) {
      const close = source.indexOf("-->", i);
      const stop = close === -1 ? source.length : close + 3;
      push(source.slice(i, stop), "comment");
      i = stop;
      continue;
    }

    if (source[i] === "<") {
      const close = source.indexOf(">", i);
      const stop = close === -1 ? source.length : close + 1;
      scanTag(source.slice(i, stop), push);
      i = stop;
      continue;
    }

    const next = source.indexOf("<", i);
    const stop = next === -1 ? source.length : next;
    push(source.slice(i, stop), "plain");
    i = stop;
  }

  return tokens;
}

const TAG_PART = /([A-Za-z_:][\w:.-]*)|("[^"]*"|'[^']*')|(\s+)|(.)/y;

function scanTag(chunk: string, push: (text: string, kind: TokenKind) => void): void {
  let first = true;
  let i = 0;
  while (i < chunk.length) {
    TAG_PART.lastIndex = i;
    const match = TAG_PART.exec(chunk);
    if (!match) break;
    const [all, name, quoted, space] = match;
    if (name) {
      push(name, first ? "tag" : "attr");
      first = false;
    } else if (quoted) push(quoted, "string");
    else if (space) push(space, "plain");
    else push(all, "punct");
    i += all.length;
  }
}
