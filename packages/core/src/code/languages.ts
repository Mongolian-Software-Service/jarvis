/**
 * What each language is made of, as data.
 *
 * A keyword list is not logic, and keeping it beside the scanner that reads it
 * buries the scanner. Adding a language means adding a row here; the lexer
 * does not change.
 */
import type { LangSpec } from "./types";

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

export const SPECS: Record<string, LangSpec> = {
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
export function familyOf(language: string | null | undefined): string {
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

