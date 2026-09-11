---
name: feature-slice
description: Build a complete Jarvis feature end to end — migration, RLS, shared logic in packages/core, server action, query, web route, and (when apps/mobile exists) the matching screen — in the correct order. Use whenever the request is to add or extend a user-facing feature: courses, lessons, quizzes, progress, enrolments, payments, the admin console. Consult it BEFORE writing any component, so the slice does not end up half-built.
---

# A feature, end to end

Build in this order. Each step is cheap to change while the ones after it do not
exist yet, and expensive once they do.

## 1. The data

Read `skills/db-migration`. Write the migration **and its policies** in the same
commit. Run `pnpm db:types`.

## 2. The shared half — `packages/core`

Anything both platforms must agree on goes here **before** any component:

- zod schemas (`schemas.ts`) — one definition, used by the server action and,
  later, by the phone's form
- labels and copy (`strings/mn/*` then `strings/en/*` — Mongolian first, it is
  the source of meaning)
- arithmetic and rules (`progress.ts`, `payments.ts`, `courses.ts`)
- paths (`courses.ts`) — every internal link is built by a function, so a route
  rename is one edit

Nothing in `packages/core` may import from `apps/*`, `next/*`, `window`,
`document` or a React Native module. It runs in three places.

## 3. The read — `apps/web/src/lib/queries/`

`import "server-only"`. Explicit `locale: Locale`. A narrow named shape with the
bilingual columns already resolved. No `select("*")`.

## 4. The write — `apps/web/src/lib/actions/`

`"use server"` → zod-parse → `requireAdmin()` (or `requireUser()`) → write with
the **request-scoped** client so RLS applies → `revalidatePath`. Return
`ActionResult`, never a thrown Postgres error.

## 5. The screen

Server component by default. A client component only for the part that needs
state or an event — the leaf, not the page. Data flows down as props; a client
component never queries.

Both languages from the start: every string comes from `t`, never a literal.

## 6. The phone

`apps/mobile` does not exist yet (CLAUDE.md §9). Until it does, a feature is
"done" on the web — but if you put business logic in a component instead of in
`packages/core`, you have made the phone's version a rewrite instead of a
screen. That is the whole cost of skipping step 2.

## Finishing

- [ ] Works signed out, signed in, and as an admin
- [ ] Works in both languages, including with the English column empty
- [ ] 360px wide with no horizontal scroll
- [ ] `pnpm typecheck && pnpm lint && pnpm build`
