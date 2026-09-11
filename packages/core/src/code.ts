/**
 * Syntax highlighting, as tokens rather than as HTML.
 *
 * A coding school that renders code as flat grey text looks unfinished, and the
 * obvious answers — Shiki, Prism, highlight.js — all produce an HTML string.
 * An HTML string is useless to `apps/mobile`, which has to draw the same
 * snippet with `<Text>` runs, and Shiki's WASM grammar engine is a heavy thing
 * to start inside a serverless request.
 *
 * So this returns **lines of tokens**, and each platform draws them: the web
 * with spans, the phone with nested Text. It is a lexer, not a parser — it does
 * not know what a type is, only what one looks like — which is the right
 * trade-off for teaching snippets of ten to forty lines.
 */

export type TokenKind =
  | "plain"
  | "keyword"
  | "string"
  | "comment"
  | "number"
  | "function"
  | "punct"
  | "tag"
  | "attr";

export type CodeToken = { text: string; kind: TokenKind };
export type CodeLine = CodeToken[];

type LangSpec = {
  lineComment: readonly string[];
  blockComment: readonly (readonly [string, string])[];
  quotes: readonly string[];
  /** Python's `"""`, checked before the single-character quotes. */
  longQuotes?: readonly string[];
  keywords: ReadonlySet<string>;
  /** CSS: `padding` in `padding: 20px` is a property, not a bare word. */
  attrBeforeColon?: boolean;
};

const JS_KEYWORDS = new Set([
  "const", "let", "var", "function", "return", "if", "else", "for", "while", "do",
  "break", "continue", "class", "extends", "new", "this", "super", "import", "from",
  "export", "default", "async", "await", "try", "catch", "finally", "throw", "typeof",
  "instanceof", "in", "of", "null", "undefined", "true", "false", "switch", "case",
  "yield", "delete", "void", "interface", "type", "enum", "implements", "readonly",
  "public", "private", "protected", "static", "abstract", "as", "satisfies", "declare",
  "string", "number", "boolean", "any", "unknown", "never", "keyof", "infer",
]);

const PY_KEYWORDS = new Set([
  "def", "return", "if", "elif", "else", "for", "while", "break", "continue", "class",
  "import", "from", "as", "with", "try", "except", "finally", "raise", "pass", "lambda",
  "None", "True", "False", "and", "or", "not", "in", "is", "global", "nonlocal",
  "yield", "async", "await", "assert", "del", "self",
]);

const SQL_KEYWORDS = new Set([
  "select", "from", "where", "insert", "into", "values", "update", "set", "delete",
  "create", "table", "alter", "drop", "index", "join", "left", "right", "inner",
  "outer", "on", "group", "by", "order", "limit", "offset", "and", "or", "not",
  "null", "primary", "key", "references", "default", "unique", "check", "returning",
]);

const SHELL_KEYWORDS = new Set([
  "cd", "ls", "npm", "pnpm", "npx", "node", "python", "pip", "git", "echo", "export",
  "sudo", "mkdir", "rm", "cp", "mv", "curl", "if", "then", "fi", "for", "do", "done",
]);

const CSS_KEYWORDS = new Set([
  "@media", "@import", "@keyframes", "@font-face", "@supports", "@theme", "@layer",
  "important", "inherit", "initial", "unset", "auto", "none",
]);

const SPECS: Record<string, LangSpec> = {
  js: {
    lineComment: ["//"],
    blockComment: [["/*", "*/"]],
    quotes: ['"', "'", "`"],
    keywords: JS_KEYWORDS,
  },
  python: {
    lineComment: ["#"],
    blockComment: [],
    quotes: ['"', "'"],
    longQuotes: ['"""', "'''"],
    keywords: PY_KEYWORDS,
  },
  sql: {
    lineComment: ["--"],
    blockComment: [["/*", "*/"]],
    quotes: ["'", '"'],
    keywords: SQL_KEYWORDS,
  },
  shell: {
    lineComment: ["#"],
    blockComment: [],
    quotes: ['"', "'"],
    keywords: SHELL_KEYWORDS,
  },
  css: {
    lineComment: [],
    blockComment: [["/*", "*/"]],
    quotes: ['"', "'"],
    keywords: CSS_KEYWORDS,
    attrBeforeColon: true,
  },
  json: {
    lineComment: [],
    blockComment: [],
    quotes: ['"'],
    keywords: new Set(["true", "false", "null"]),
    attrBeforeColon: true,
  },
};

/** Which scanner a fence's language tag maps to. */
function familyOf(language: string | null | undefined): string {
  const tag = (language ?? "").toLowerCase();
  if (["js", "jsx", "javascript", "ts", "tsx", "typescript", "mjs", "cjs"].includes(tag)) return "js";
  if (["py", "python"].includes(tag)) return "python";
  if (["sql", "postgres", "psql"].includes(tag)) return "sql";
  if (["sh", "bash", "shell", "zsh", "console", "terminal"].includes(tag)) return "shell";
  if (["css", "scss", "less"].includes(tag)) return "css";
  if (["json", "jsonc"].includes(tag)) return "json";
  if (["html", "xml", "svg", "vue"].includes(tag)) return "markup";
  return "plain";
}

export function highlight(code: string, language?: string | null): CodeLine[] {
  const family = familyOf(language);
  if (family === "plain") return toLines([{ text: code, kind: "plain" }]);
  if (family === "markup") return toLines(scanMarkup(code));
  const spec = SPECS[family];
  if (!spec) return toLines([{ text: code, kind: "plain" }]);
  return toLines(scan(code, spec));
}

/** Tokens may contain newlines (a block comment, a template string). Lines cannot. */
function toLines(tokens: readonly CodeToken[]): CodeLine[] {
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

function scan(source: string, spec: LangSpec): CodeToken[] {
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
function scanMarkup(source: string): CodeToken[] {
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
