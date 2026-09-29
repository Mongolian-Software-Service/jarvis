# TsStark Academy

An online coding school in Mongolian. Students buy one bundle, work through
video and written lessons, and their progress follows them. A small team runs
the whole thing from one admin console.

**This is a website, and only a website.** There was an Expo app; it is gone,
and so is every trace of it — see CLAUDE.md §9.

```
apps/web        Next.js 16, the site and the console
packages/core   everything that is not a screen: strings, schemas, markdown,
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
pnpm dev            # http://localhost:3001
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
