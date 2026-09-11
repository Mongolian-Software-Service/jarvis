# Jarvis

An online coding school in Mongolian, with an English edition. Students buy a
course, work through video, written and code lessons, and their progress follows
them. A small team runs the whole thing from one admin console.

```
apps/web        Next.js 16, the site and the console
apps/mobile     Expo — planned, not built yet (CLAUDE.md §9)
packages/core   everything both platforms share: strings, schemas, markdown,
                the syntax highlighter, formatting, progress arithmetic
packages/types  generated Supabase types
supabase/       migrations, RLS, seed
```

**Start here:** [SETUP.md](./SETUP.md) — from `pnpm install` to a deployed site.
**Then read:** [CLAUDE.md](./CLAUDE.md) — the contract. Stack, schema, design
rules, and the reasoning behind the decisions that look odd.

```bash
pnpm install
cp .env.example apps/web/.env.local
pnpm dev            # http://localhost:3000
```

| | |
| --- | --- |
| `pnpm build` | production build — must be clean |
| `pnpm typecheck` | `next typegen && tsc --noEmit` |
| `pnpm lint` | eslint |
| `pnpm test` | the pure logic in `packages/core` |
| `pnpm db:push` | migrations → linked Supabase project |
| `pnpm db:types` | regenerate `packages/types/src/database.ts` |

Claude Code is set up in `.claude/`: four skills (`db-migration`,
`feature-slice`, `lesson-content`, `payments`), five commands (`/ship`, `/db`,
`/feature`, `/lesson`, `/review`) and two review agents.
# jarvis
