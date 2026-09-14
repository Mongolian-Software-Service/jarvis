---
name: feature-slice
description: Build a complete TsStark Academy feature end to end — migration, RLS, shared logic in packages/core, server action, query, web route, and (when apps/mobile exists) the matching screen — in the correct order. Use whenever the request is to add or extend a user-facing feature: courses, lessons, quizzes, progress, enrolments, payments, the admin console. Consult it BEFORE writing any component, so the slice does not end up half-built.
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

`apps/mobile` exists (CLAUDE.md §9), so a feature is not done on the web alone —
it is done when the phone has the matching screen, or when there is a reason
written down for why it never will (paid checkout, for one: decision #009).

The screen is the easy half **if** step 2 was done properly. Every rule the web
worked out — which lesson «Үргэлжлүүлэх» opens, which course to resume, what a
valid message is — has to be a function in `packages/core` that both platforms
call. Leave one inside a web component and the phone's version is a rewrite
rather than a screen, and the two drift the first time somebody edits one.

## Finishing

- [ ] Works signed out, signed in, and as an admin
- [ ] Works in both languages, including with the English column empty
- [ ] 360px wide with no horizontal scroll
- [ ] `pnpm typecheck && pnpm lint && pnpm build`
