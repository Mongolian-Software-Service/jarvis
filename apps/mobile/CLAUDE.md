@AGENTS.md

---

The contract for this app is the root [`../../CLAUDE.md`](../../CLAUDE.md).
§9 is the plan this app is built to; §4 is the design language it shares with
the web, expressed as `theme.ts` in `@jarvis/core` rather than as CSS — one
palette, dark, with no light edition on either platform.

**The rule that matters most here:** anything both platforms have to agree on —
copy, schemas, the Markdown parser, the highlighter, progress arithmetic, date
and money formatting, the shape of a row — lives in `packages/core` and is
imported. If you find yourself writing a second copy of a rule that the web
already has, stop and move the original into core instead.
