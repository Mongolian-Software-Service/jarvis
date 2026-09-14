---
description: Pre-commit checklist for TsStark Academy
---

Walk this before I commit. Report pass/fail per line, fix what you can, and list
what needs me.

1. `pnpm typecheck && pnpm lint && pnpm build` — all three clean.
2. New table or column? RLS enabled, a policy written, `pnpm db:types` run.
3. Any secret reachable from a client component? `SUPABASE_SECRET_KEY` appears
   in exactly one file. Grep `.next/static` for it.
4. Every new server action: zod-parses first, re-checks admin on the server.
5. New user-facing string: is it in **both** `strings/mn` and `strings/en`?
   A key in one and not the other does not compile — confirm it built.
6. New env var: is it in `turbo.json`'s build `env` array *and* `.env.example`?
7. Ө ө Ү ү still render in the webfont on a page you changed.
8. 360px wide, no horizontal scroll, on the routes you touched.
9. Any file over ~300 lines that should be split?
