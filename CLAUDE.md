# TsStark Academy — online coding school

This file is the contract. When a prompt says "§4" or "§6", it means a section
here. If something in this document is wrong, or has become wrong, **fix this
file first, then the code.** Do not let the two drift.

---

## §1 What this is

A Mongolian-language school that teaches people to write code, with a secondary
English edition. Students work through video + written + coding lessons, and
their progress follows them between a laptop and a phone.

**There is one price, and it buys everything, for good.** Six tracks —
Танилцуулга (free), Кодын суурь, Landing page, Fullstack website, iOS/Android,
2D/3D тоглоом. A course is **not sold on its own**: no screen shows a per-course
price, `/api/checkout` sells only the bundle, and `courses` has no price column
to read. Six prices is a decision somebody has to make before they have any way
of making it; one price is no decision at all, which is the point.

So a course says one thing about money — `courses.is_free`. Free means anyone
signed in may take it (the intro track); anything else opens with the bundle.
That flag is the whole model: the free-enrolment RLS policy reads it, the card
prints «Үнэгүй» or «Багцад багтсан» from it, and the admin console offers a
checkbox rather than an amount.

Two constants in `packages/core/src/constants.ts` carry the price:
`BUNDLE_PRICE_MNT` is what is charged and `BUNDLE_FULL_PRICE_MNT` is the number
it is struck through from — an anchor the school advertises, not a sum of
anything. `BUNDLE_SAVING_MNT` is their difference, derived once, and is the only
saving any screen prints.

If a single course is ever sold again, it comes back as a price column **plus**
an ADR — not by quietly re-reading `is_free`.

### The name

**TsStark Academy** — Latin, capitalised. Never transliterated into Cyrillic and
never translated: `SITE_NAME` is one string, and a wordmark that changes shape
inside the product stops being the one fixed point on the page. Where a
Mongolian sentence needs a case suffix, attach it with a **non-breaking hyphen**
— `TsStark‑ийн` (U+2011, not U+002D) — so the line cannot break between the name
and its ending.

**The school and the company are two names.** `SITE_NAME` is the school;
`COMPANY_NAME` (**TsStark**) and `COMPANY_URL` (**tsstark.com**) are who runs
it, and the footer says so — a school with a company behind it is a school
somebody can still reach next year. They are separate constants rather than one
string and a `.split(" ")`, because that rule breaks the first time either name
changes. The footer's «Powered by» stays **English** beside the Latin mark: it
is brand lettering, not copy, and half-translating it would give the company two
shapes.

It was called **Jarvis** until this rename. What changed is the brand — every
string a reader sees, the phone's home-screen label, the documents. What did
**not** change is the plumbing: the `@jarvis/*` workspace scopes, the phone's
`jarvis://` scheme and `mn.jarvis.app` bundle id. Those are identifiers, not
names — nobody outside the repository reads a package scope, and the scheme and
bundle id are registered with Supabase's redirect allowlist and the app stores,
where renaming them breaks Google sign-in on the phone and resets app identity.
**Rename them only with an ADR that says who is updating those two registries.**

- **One language: Mongolian.** It shipped bilingual and is not. A
  half-translated second edition doubles every copy change and shows somebody a
  screen in a language the rest of the product is not written in. `LOCALES` has
  one member, there is no switcher, and `/en` is nothing. The `_en` columns stay
  in the database, unread, because dropping them throws away translations
  somebody may still want.
- A bare URL goes to `/mn`. `Accept-Language` is not consulted and now could
  not be.
- Small team. One admin console, no roles beyond `student` and `admin`.

### Content model (settled — do not revisit without saying so)

```
course  →  module  →  lesson  →  quiz_questions
```

A lesson is **not** four different tables. One row carries any of four things,
because a real lesson is usually three of them at once: watch this, read the
notes, write the code, answer two questions. `kind` says what it leads with;
the columns say what it actually has.

| kind | leads with | must have |
| --- | --- | --- |
| `video` | the player | `video_url` |
| `text` | the writing | `body_mn` |
| `code` | the exercise | `starter_code` |
| `quiz` | the questions | rows in `quiz_questions` |

The database enforces those three constraints (§5). A lesson with a video and
a body and an exercise is normal and needs no new kind.

**The school teaches directing, not typing.** Nobody writes code: a student
learns what the pieces are called, how to ask for them clearly, and how to
check what comes back. So a lesson body carries **no code blocks** — prompts go
in `>` quotes, and a `code` lesson kind would promise an exercise there is not.
«Танилцуулга хичээл» and «Кодын суурь» are the two rewritten so far; the other
four still teach syntax and are next.

**A course may carry a handbook** — a PDF companion built from
`docs/handbook/*.html` by `pnpm handbook`, which prints it with headless Chrome
and writes the page count back into `packages/core/src/handbooks.ts`. The PDF is
committed, because the build needs a browser the deploy does not have. It is
**public**, deliberately: a stranger who downloads it and learns what a server
is has been taught something, which is the argument for the school. The document
is light where the product is dark (§4) — a page gets printed, and that is a
different medium, not a second theme.

**Every course ends with an exam**: a final module named «Шалгалт» holding one
`quiz` lesson of **ten** questions, passed at 60% (`QUIZ_PASS_SCORE`). The
fourth constraint is the one Postgres cannot express — questions live in another
table, so a `quiz` lesson with none applies cleanly and then opens as an empty
exam at the very end of a course. `scripts/check-seed.mjs` refuses that, and is
wired into `pnpm test`.

---

## §2 Stack, commands, environment

| Concern | Choice |
| --- | --- |
| Monorepo | pnpm workspaces + Turborepo |
| Web | Next.js **16** App Router, React 19, TypeScript strict |
| Mobile | Expo SDK 57 + expo-router, `apps/mobile` (§9) |
| Styling | Tailwind **v4** (CSS-first `@theme`, no `tailwind.config.js`) |
| Data | Supabase — Postgres + RLS + Auth + Storage |
| Payments | **Bonum** (MNT). `BONUM_MOCK=1` settles locally (§6.7) |
| Deploy | Vercel (web), EAS (mobile, later) |
| i18n | Hand-rolled string tables in `packages/core` — **not** next-intl (decision #003) |
| Motion | CSS transitions, plus one keyframe loop (`.marquee`). No animation library. |

```bash
pnpm dev              # turbo dev — web on :3001
pnpm dev:mobile       # expo start — the phone
pnpm build            # must be clean: zero errors, zero warnings
pnpm typecheck        # next typegen && tsc --noEmit
pnpm lint
pnpm db:push          # push migrations to the linked Supabase project
pnpm db:reset         # LOCAL stack only — re-runs migrations + seed
pnpm db:types         # regenerate packages/types/src/database.ts
```

### Next.js 16 — this is not the Next you remember

Read `apps/web/node_modules/next/dist/docs/` before writing framework code.
The four that bite hardest:

1. **`middleware.ts` is now `proxy.ts`**, and the exported function is `proxy`.
   The `edge` runtime is not available there; it runs on Node, which is what
   `@supabase/ssr` wants anyway.
2. **`params`, `searchParams`, `cookies()`, `headers()` are async.** The
   synchronous compatibility window from 15 is gone.
3. **Typed route props**: `PageProps<"/[locale]/courses/[slug]">` and
   `LayoutProps<"/[locale]">` are generated by `next typegen` — which is why
   `typecheck` runs it first.
4. **Turbopack is the default** for `dev` and `build`.

### `NODE_OPTIONS=--max-http-header-size` on the dev script

`apps/web`'s `dev` and `start` scripts raise Node's header limit from its
default 16KB to 64KB. That is not a performance knob and it is not cargo:
without it `localhost:3001` answers **HTTP 431** — *Request Header Fields Too
Large* — and it does so from inside Node's HTTP parser, before Turbopack, the
proxy or any route sees the request. There is nothing to catch and nothing to
log; the browser shows a bare error page and the site looks dead.

It happens because **cookies ignore port numbers**. `localhost:3000`,
`localhost:5173` and `localhost:3001` are one origin as far as the cookie jar
is concerned, so every dev server the machine has ever run leaves its cookies
where this one has to read them. Add our own — a Supabase session is chunked
across `sb-<ref>-auth-token.0`, `.1`, … at ~3.2KB each — and Next's own
`Next-Router-State-Tree` on client navigations, and 16KB arrives sooner than
anybody expects. A browser profile used for a lot of local work hits it; a
clean one does not, which is what makes it look like a bug in the app.

`jarvis.mn` is not exposed to this: on a real domain the jar is ours alone,
and our own cookies come to roughly 7KB. So this belongs on the dev script and
nowhere else. **If it is ever hit again, the fix is to clear the cookies for
`localhost`, not to raise the number again.**

### 500s with a `JSON.parse` SyntaxError are a corrupt `.next` manifest

The symptom: every page answers **500**, the trace says
`SyntaxError: Unexpected non-whitespace character after JSON at position N`
with no file of ours in it, and `typecheck`, `lint` and `build` are all clean —
which is what makes it look like the app broke rather than the cache.

The file is `apps/web/.next/dev/prerender-manifest.json`, and "position N" is
exactly where a **complete** JSON document ends and a duplicated fragment of its
own tail begins. Two processes wrote it and the writes interleaved. Two ways to
arrange that, and the second is the one that actually bit:

1. `pnpm build` running against a live dev server — they share the directory.
2. **Restarting the dev server too quickly.** `pkill` returns immediately;
   Next does not. The dying server flushes this manifest *after* the new one has
   written it. `sleep 2` is not enough — wait for the process to be gone.

```bash
pkill -f "next dev"
while pgrep -f "next-server" >/dev/null; do sleep 1; done
rm -rf apps/web/.next && pnpm dev:web
```

Deleting `.next` alone does not help if the race repeats on the way back up,
which is why the wait is the part that matters.

### Environment

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=    # safe in a browser bundle; RLS protects the data
SUPABASE_SECRET_KEY=                     # server-only, bypasses RLS. NEVER NEXT_PUBLIC_
NEXT_PUBLIC_APP_URL=
BONUM_MOCK=1                             # dev only; ignored when NODE_ENV=production
BONUM_API_BASE_URL= BONUM_APP_SECRET= BONUM_TERMINAL_ID=
BONUM_MERCHANT_CHECKSUM_KEY= BONUM_CALLBACK_URL=
```

`SUPABASE_SECRET_KEY` is read in exactly one file —
`apps/web/src/lib/supabase/server.ts` — and that file starts with
`import "server-only"`. There is exactly **one** legitimate caller of
`createServiceSupabase()`: the Bonum webhook. Anything else reaching for it is a
bug, including "the type checker was easier this way".

**Every variable must also be listed in `turbo.json`'s build `env` array.**
Turborepo 2 runs builds in strict env mode: a variable missing from that list is
not passed to the build however carefully it was set on Vercel, *and* is not part
of the cache key — so a build can be restored from a cache made with a different
value and nobody is told.

---

## §3 Layout

```
apps/web            Next.js 16
apps/mobile         Expo SDK 57 — catalogue, player, progress, account
packages/core       locale, strings, schemas, markdown, highlighter, formatting
packages/types      generated database types
supabase/           migrations, seed.sql, config.toml
docs/decisions/     ADRs — read before changing architecture
```

### §3.1 One file, one screenful — 160 lines, enforced

**No file in this repository holds more than 160 lines of code.** It is a hard
rule: `scripts/check-lines.mjs` runs inside `pnpm test`, and a file over the
limit fails the build the same way a broken type does.

**Comments and blank lines do not count.** This codebase explains itself at
length on purpose, and a cap that counted prose would be paid for by deleting
the reasoning behind the code — the one thing here that cannot be recovered by
reading the code again. So a heavily documented 300-line file can be perfectly
legal; it is the *code* that is capped. Never delete a comment to get under the
number. If a file is over, it is over because it is doing too much.

The number is not the point — the pressure is. A 400-line component is three
components that were never named, and the names are the part worth having: they
are what the next person greps for, what they can change without reading the
other two, and what reveals that a piece belongs in `packages/core` rather than
beside one screen. The cap makes that pressure constant instead of a thing
somebody remembers to apply.

Four things are exempt, each for a reason written beside it in the checker:
`packages/types/src/database.ts` (generated), `supabase/migrations/**` (applied
history — rewriting one desynchronises `applied_migrations`), `supabase/seed.sql`
(course prose, not code) and `globals.css` (§4.1 — the palette is one place to
look). **Adding to that list is a decision, not a shortcut.**

Not ESLint's `max-lines`: lint runs in `apps/web` and `apps/mobile` only, so
`packages/core`, `scripts/` and `supabase/` would have been exempt by accident
rather than by decision.

```bash
pnpm check:lines           # report
pnpm check:lines --list    # every file, longest first
```

`apps/web/src`:

```
proxy.ts                    locale + session refresh + the private-route gate
app/[locale]/layout.tsx     THE ROOT LAYOUT. There is no app/layout.tsx — see below
app/[locale]/(site)/        public URLs: landing, catalogue, course page, about,
                            contact, checkout — marketing shell for a visitor,
                            the app rail for anybody signed in
app/[locale]/(app)/         signed in only: guide, dashboard, my courses, account
app/[locale]/(study)/       the course screen and the lesson player
app/[locale]/(auth)/        sign-in, sign-up
app/[locale]/(admin)/       the console
app/api/                    checkout, the Bonum webhook
components/{ui,layout,course,lesson,admin}/
lib/{supabase,queries,actions}/  lib/bonum.ts  lib/seo.ts  lib/locale.ts
```

**Four shells, and the split is deliberate.** `(site)` is for somebody deciding
about the product; `(app)` is for somebody who already decided, and it carries
the student's own five destinations rather than the site header's eight.
`(study)` is separate from `(app)` because a lesson already has its own syllabus
column — a second navigation beside it would squeeze the thing the reader came
for. The groups do not appear in the URL, so `/mn/learn` and
`/mn/learn/react-next/state` live in different shells at the same path prefix.

**The signed-in navigation is a tab bar, the way the phone does it.** One array
of links in `components/app/nav.tsx`, drawn two ways: a **fixed bar along the
bottom** below `lg`, inside the thumb's reach and never scrolled away, and a row
in the top bar above it, because a bottom bar on a 27-inch screen puts the
navigation as far from the content as the geometry allows. Both shapes come from
the same component, so a link cannot exist on one and not the other. The tab bar
pads itself by `env(safe-area-inset-bottom)` and `main` reserves `pb-24`, or the
last line of every page sits under it.

Labels come from `t.nav.tab.*` — short forms written for a 72px-wide tab, and
used by `apps/mobile` too. Truncating «Миний сургалт» would leave a beginning,
not a name.

**A page owns its own column.** Every page carries `.shell`; no shell adds one.
Two nested `.shell`s double the gutter, which costs a fifth of the width on a
390px phone and is invisible on the laptop it was written on.

**A page spends the width it is given.** A 42rem column down the middle of a
78rem page is two-thirds empty screen, and a product that looks unfinished is a
poor argument for a school that sells finishing things. Prose is the exception —
it stays at `.measure`, because a 90-character line is harder to read, not more
generous — so a text-heavy screen pairs the reading column with something that
earns the rest: a picture, a set of numbers, an aside. `(app)/hello` is the
worked example, and `components/app/course-trail.tsx` is how one component
carries two layouts: a winding column on a phone, one horizontal track on a
laptop, both drawing the same node so they cannot drift.

**The shell follows the reader, not the URL.** A signed-in person never sees the
marketing chrome: `(site)/layout.tsx` renders `AppShell` — the same rail `(app)`
uses — the moment `getViewer()` returns somebody. The catalogue, a course page,
about, contact and checkout are public *because a stranger must be able to read
them*, not because a student should be thrown back out to the sales bar every
time they open the catalogue from their own rail. So `components/layout/header.tsx`
knows nothing about sessions — it only ever renders for somebody who has none —
and inside the product the wordmark goes to the dashboard, never to `/`.

The front page is the exception and handles itself: it redirects a signed-in
visitor to `landingPath()` before any of this matters — which is why a link to
`/` from inside the product is a link that bounces straight back to where it
was clicked.

**The admin rail's only way out is «Гарах».** It carried a "view site" link
once; that went, because the console is somewhere the team is *working* and a
link back to the shop floor is a way to lose your place mid-edit. Previewing a
course still has its own link, on that course's row, where the thing being
previewed is unambiguous. `t.admin.nav.viewSite` is that row's label and is
still used — it is the rail-level version that is gone.

**There is no `app/layout.tsx`.** `app/[locale]/layout.tsx` is the root layout,
and that is load-bearing rather than a preference: `next/root-params` only
exposes segments sitting *above* the root layout, which is what lets any server
component ask for the current language without every page passing it down. Add a
passthrough layout above it and `getLocale()` stops working everywhere at once.

---

## §4 Design

**The language is Linear's** (linear.app), and it was measured rather than
remembered: the values below came off that site's computed styles.

**There is one theme and it is dark.** Not a default with a light alternative —
the only edition there is. This is a product people open at night to write
code, and a second palette is a second set of contrast decisions, a toggle, a
cookie, a `theme-color` that has to follow it and a whole column of the ship
checklist, all to serve a reader who is already looking at a dark editor. So
there is no `data-theme` attribute, no `light:` variant, no toggle in the
header and no theme row in the phone's settings. The palette below is **the**
palette. If a light edition is ever wanted, it comes back as a decision in
`docs/decisions/`, not as a quiet `[data-theme="light"]` block.

Four things carry the resemblance. Change any of them and it stops looking like
this:

1. **Type is light, not bold.** Headings are weight **510**, emphasis 590, and
   nothing on the site is heavier. The weight scale is remapped in `@theme`, so
   `font-medium` already means 510 — do not reach for `font-bold`.
2. **Controls are pills.** 32px tall, 13px text, `rounded-full`. The primary
   action is `--solid`: a near-white pill on the near-black ground, carrying
   **no colour at all**. Purple is the accent — links, focus, the current row —
   and is the `accent` button variant, used rarely.
3. **Hairlines are translucent**, `rgba(255,255,255,0.08)`, not a grey. They
   then read correctly over any surface and over an image.
4. **The ground is near-black and cool** (`#08090a`), and the four surface steps
   above it are almost imperceptible. A card is found by its hairline.

Headings: `line-height: 1.1`, `letter-spacing: -0.022em` — both measured.
Beware that Tailwind's `text-5xl` ships `line-height: 1`, which beats the base
rule and sets a two-line Mongolian headline solid; name the leading explicitly
on any heading that can wrap.

### 4.1 Tokens — `apps/web/src/app/globals.css`

Two layers, and the arrangement is still load-bearing with one theme:

- Semantic values live in `:root` as plain custom properties. That is the
  single source of the palette — `@layer base` rules, inline `style`
  attributes and `packages/core/src/theme.ts` (via its drift test) all read
  these names, and only a custom property can be named from all three.
- `@theme inline { --color-panel: var(--panel); … }` maps Tailwind's utility
  names onto **references**, so `bg-panel` and `background: var(--panel)`
  resolve to the same declaration rather than to two copies of a hex that
  drift. A plain `@theme` would bake today's value into every utility.

**Any token that is only ever named from an inline `style` must live in
`:root`, never in `@theme`.** Tailwind v4 tree-shakes a theme variable that no
*emitted rule* mentions, and the class scanner cannot see a TSX `style`
attribute. That is why `--tint-*` (topic chips) and `--viz-*` (charts) are in
`:root`. Put them in `@theme` and every chip renders the same colour.

### 4.2 One typeface, and the detail that breaks Mongolian

**Inter** for everything, **JetBrains Mono** (latin only) for code. A separate
display face is the first thing that would break the resemblance, and Inter's
Cyrillic was drawn alongside its Latin — which is not true of most grotesques
that carry the subset at all.

Inter must load `latin, cyrillic, cyrillic-ext`. Google's `cyrillic` subset
covers U+0400–045F; Mongolian's two distinctive vowels sit outside it:

- **Ө / ө** = U+04E8 / U+04E9
- **Ү / ү** = U+04AE / U+04AF

Both are in `cyrillic-ext` (U+0460–052F). Ship `cyrillic` alone and every Ө and
Ү falls back to a system font mid-word, at a different weight and width —
өнөөдөр, үзэх, төрийн, үндэсний all hit it constantly. **Verify it, do not
assume it**: render `ӨөҮү` and `Ооо` in the page font and compare their widths
against a `serif` fallback. Same width as the fallback means the webfont does
not have them.

Mono is Latin-only by decision: a monospace drawn for code has poor Cyrillic
proportions, and dropping two subsets takes weight off the critical path. Never
put `font-mono` on Cyrillic text.

### 4.3 Typesetting for Mongolian Cyrillic

- Interface `line-height: 1.6`, lesson prose 1.75. Linear sets 1.5; Cyrillic has
  a tall x-height and few descenders, and at 1.5 a Mongolian paragraph closes up
  into a grey slab. This is the one place the reference is not followed.
- **Never justify.** There is no hyphenation dictionary for `mn`; justified text
  opens rivers. Stated in `globals.css` as a ban on `justify` rather than as
  `text-align: start` on every paragraph — the blanket version wins the cascade
  against a deliberate `text-center` on a parent, and pulls a centred hero's
  kicker out to the left margin.
- `overflow-wrap: break-word` on headlines — compounds are long.
- **No uppercase on Mongolian.** It is keyed on `:lang(en)` in one place in
  `globals.css` (`.kicker`), not left to each component.
- Dates never use `Intl` (§6.5). `2026 оны 9-р сарын 11`, never US order.

### 4.4 Layout rules

- `.shell` is the centred column: 78rem, 1.25rem gutters at 360, 2rem at 768.
- Verify at exactly **360 / 768 / 1440**. No horizontal scroll at 360 on any
  route — measure `documentElement.scrollWidth` against `innerWidth`.
- Horizontal strips scroll inside themselves and set `scroll-padding` matching
  their padding, or the browser scrolls the leading gutter away on load.
- A card is **one tab stop**: the headline's anchor is stretched over the whole
  card (`.card-link`), so the focus ring lands on the title, not a picture.
- Code blocks scroll in their own `overflow-x: auto` box. Long lines are normal.
- Hand-written `:hover` rules go inside `@media (hover: hover)` — on touch,
  `:hover` sticks after a tap. Tailwind's `hover:` variant already does this.

### 4.5 Syntax highlighting is ours

`highlight()` in `packages/core/src/code.ts` returns **lines of tokens**, not an
HTML string. Shiki, Prism and highlight.js all return HTML, which is useless to
`apps/mobile` — the phone has to draw the same snippet with `<Text>` runs. The
web renders tokens as spans coloured by `--tok-*`, one set, chosen against the
near-black code ground. It is a lexer, not a parser, which is the right trade
for teaching snippets of ten to forty lines.

The same reasoning gives us `parseMarkdown()`: a lesson body parses to a small
typed tree that each platform renders. It also means no
`dangerouslySetInnerHTML` anywhere in this codebase.

---

## §5 Data model

See `supabase/migrations/`. Tables: `profiles`, `courses`, `modules`, `lessons`,
`quiz_questions`, `enrollments`, `lesson_progress`, `payments`.

Three things that are decisions rather than details:

1. **`user_id` references `public.profiles`, never `auth.users`.** Same rows
   either way, but `auth.users` is not in the exposed schema, so PostgREST
   cannot see a relationship to it — and every screen that shows *who did
   something* needs that join.
2. **`lessons.course_id` is denormalised** from the module and kept honest by a
   trigger. Access checks, progress and "next lesson" are all per course.
3. **A view's columns are all nullable to TypeScript.** Postgres does not carry
   NOT NULL through a view, so `lesson_outline` generates as nullable
   throughout even though it projects from columns that are not. The mappers in
   `packages/core/src/shapes.ts` take the nullable shape and coerce once,
   rather than every call site guessing.
4. **Slugs are a domain** (`public.slug`), lowercase Latin kebab-case, enforced
   by the database so a Cyrillic slug can never be saved.

### 5.1 The rule the whole schema turns on

**A lesson you have not paid for is not readable, by any client, through any
query.** Hiding a locked lesson in the interface is decoration; PostgREST hands
out whatever the policies allow, and the publishable key is in every bundle.

RLS is row-level, so the body cannot be withheld while the title is shown on one
table. Hence `public.lesson_outline` — an owner-invoked view over published
courses that projects **away** every paid column. The syllabus reads the view;
the player reads the table. **Before adding a column to that view, ask whether a
stranger may read it.**

`is_admin()` checks the JWT `app_metadata` claim first, then `profiles.role`.
**Never `user_metadata`** — a signed-in user can write their own, so a role read
from there is a role anybody can award themselves. Column-level UPDATE on
`profiles.role` is revoked from `authenticated`; `set_user_role()` is the door
for changing a role, and it asks who is knocking.

There is one other way in, and only at the moment an account is created:
`public.admin_emails` lists the owner's address, and `handle_new_user()` gives a
new profile the admin role when its address is on that list. It exists so a
fresh database is never left with nobody who can run the school. **It is only as
strong as being first to register that address** — this project has Supabase's
auto-confirm on, so a sign-up is treated as verified without anybody reading the
mail. Right for a one-owner school; wrong for a list that grows. Nothing can
write to that table through the API.

---

## §6 Application rules

### 6.1 Query layer — `apps/web/src/lib/queries/`

- Every file starts with `import "server-only"`.
- Every function takes `locale: Locale` **explicitly**. There is no ambient one.
- Every function returns a narrow, named shape with the bilingual columns
  already resolved, so no component holds a `title_mn` and has to remember the
  fallback rule.
- **`select("*")` is banned.** List the columns.
- No query runs from a client component. Data flows down as props.

### 6.2 Mutations — `apps/web/src/lib/actions/`

Every action, in this order: `"use server"` → zod-parse the input → re-check
admin **on the server** → write through the *request-scoped* client so RLS
applies → `revalidatePath`. Return `{ ok: true } | { ok: false, error, fields }`;
never throw a raw Postgres error at the interface.

An admin action that used the service client would be a second, weaker copy of
the rules.

### 6.3 Locale fallback

When the English translation of something is missing:

- **Do not 404.** Render the Mongolian.
- Mark that block `lang="mn"`, or a screen reader pronounces Cyrillic with
  English rules and browser translation offers to translate a page it has
  already decided is English.
- Show the small notice (`t.learn.fallbackNotice`).
- `mn` is always complete. English is the edition that can have holes.

### 6.4 Rendering

Everything under `(site)` and `(admin)` is `force-dynamic`. Every page wears a
header that says who is signed in, so a prerendered copy is one visitor's
session served to everyone.

**Never wrap `cookies()` or `headers()` in a `try/catch` that swallows.** During
a prerender they throw a *signal* meaning "this route is dynamic". Swallowing it
prerenders the page as if nobody were signed in — and every visitor is then
served one build's worth of "you have no courses" from the CDN.

### 6.5 Formatting without `Intl`

`packages/core/src/format.ts` formats dates and money by hand. Two reasons:
`Intl` data differs between Node and a browser engine (a hydration mismatch on a
page that looked fine), and React Native's Hermes ships without full ICU on
Android — so `Intl.DateTimeFormat("mn-MN")` silently returns an English-looking
date on the phone this module is shared with.

### 6.6 Signing in

Two ways in: email and password, or Google. Both are Supabase Auth, and the
provider's own credentials live in the Supabase dashboard — nothing about Google
is configured in this repository (SETUP.md step 7 has the two dashboards).

- **One button, both jobs.** An address Google knows and Supabase does not
  becomes an account on the first tap; after that the same button signs in. The
  copy says "continue with", and the same component sits on the sign-in page and
  the sign-up page. There is no separate "sign up with Google" path to keep in
  step.
- **The role never comes from the provider.** `handle_new_user()` takes the
  name and picture out of the claims and nothing else. An account arrives as a
  student unless its address is on the owner list (§5).
- **Овог, нэр, утас.** A Mongolian name is two fields and the order matters —
  овог first, so greeting by `first_name` is correct rather than lucky. Google
  supplies both (`given_name`, `family_name`) and never a phone, which is the
  school's only reliable way to reach somebody; so `AppShell` shows
  `ProfileGate` once to anybody missing any of the three. «Дараа бөглөнө» is a
  day's cookie, not a column.
- **The web starts OAuth on the server** (`signInWithGoogle` in
  `lib/actions/auth.ts`), so `@supabase/ssr` writes the PKCE verifier into the
  same cookie jar `/auth/confirm` reads it back from. That route already handled
  `code` for email links; Google reuses it.
- **`next` is validated before it is used.** Only a path on this site — an
  absolute URL there would make the sign-in button an open redirect.
- **The phone uses the system browser**, not a WebView: `openAuthSessionAsync`
  with a `Linking.createURL` redirect, which resolves to `exp://…` in Expo Go and
  `jarvis://…` installed. Both need to be in Supabase's redirect allowlist, and
  Google requires a real browser anyway.
- **Where a new session goes is one function**, `destinationAfterSignIn()` in
  `packages/core/src/courses.ts`, and all three doors call it: the password
  form, the sign-up form, and `/auth/confirm` (which catches Google and every
  email link). It honours an explicit `next` — "sign in to buy this course" —
  but only a path on this site, and **never the marketing page**: signing in
  from the front page sets `next` to the front page, and landing back on the
  pitch is the one destination somebody who just signed in cannot have meant.
  Otherwise `landingPath()` decides from the role: the team to the console,
  everybody else to their dashboard.
- **Each door must *read* the role, never assume it.** All three now do
  (`roleOfCurrentUser()`, or the same query inline in `/auth/confirm`). It is
  read from `profiles` rather than from the token because a role granted a
  moment ago is in the table straight away and in the JWT only after it
  refreshes — and the owner's role is granted by `handle_new_user()` during the
  very sign-up that is about to redirect. `signUp` passed a literal `"student"`
  for a while, which sent the one account that runs the school to a student
  dashboard and made the owner allowlist look broken.
- **The mark is Google's.** `GOOGLE_MARK` in `packages/core` holds the four-colour
  path data both platforms draw, unrecoloured. It is the only place in this
  codebase where a colour is a literal rather than a token, because those four
  are not ours to theme.

### 6.7 Payments

The gateway is the only authority on whether money moved. Nothing opens a course
anywhere else. The webhook authenticates the call (constant-time HMAC over the
**raw** body) and forwards it to `settle_payment()`, which marks the invoice and
creates the enrolment **in one transaction** — money taken with nothing unlocked
is a support call, and a serverless function killed between two statements is
how it happens. The function is idempotent: gateways retry.

**A payment carries `course_id = null`**, and `settle_payment()` reads that as
"enrol them in every published course" — in one statement, inside the
transaction that marks the invoice paid. Every new payment looks like this,
because the bundle is the only thing sold; the column stays nullable-with-a-
branch so payments taken for one course before that was true still say what
they bought. A course added later is not retroactively granted;
`grant_all_courses()` is how the console does that by hand.

`BONUM_MOCK=1` settles locally so the whole purchase → enrolment path can be
walked without a merchant account. It requires `NODE_ENV !== "production"`, and
that test is the safety, not a convention.

---

## §7 Ship checklist

**Correctness** — `pnpm build` clean, `pnpm typecheck` clean, `pnpm lint` clean,
`pnpm test` clean — which includes the seed guard and the 160-line cap (§3.1) —
no `console.log`, no unused dependency, no placeholder copy on a public route.

**Security** — grep `.next/static` for the secret key. `is_admin()` reads
`app_metadata`. RLS on every table; anon cannot read a paid lesson and cannot
write. Every action zod-validates and re-checks admin. Storage denies anonymous
writes.

**Mongolian** — Ө ө Ү ү render in the webfont, not a fallback. Dates are
`2026 оны 9-р сарын 11`. No justified text, no uppercased Cyrillic.
`<html lang>` matches; fallback blocks carry `lang="mn"`.

**Layout** — no horizontal scroll at 360 on any route (measure it). Front page
and one lesson page checked at 360 / 768 / 1440.

**Performance** — Lighthouse mobile ≥ 90 performance and accessibility on the
front page and one course page. The LCP element is the first course cover and it
is `priority`; the others are not.

---

## §8 Build order

0. Monorepo, tokens, fonts, Supabase clients ✅
1. Schema, RLS, seed, types ✅
2. Query layer ✅
3. Public site — landing, catalogue, course page ✅
4. Auth — sign-in, sign-up, account ✅
5. The player — video, markdown, exercise, quiz, progress ✅
6. Admin — dashboard, course/lesson editors, students, payments ✅
7. Payments — Bonum checkout, webhook, mock mode ✅
8. `apps/mobile` — catalogue, course, player, quiz, progress, account ✅
9. **Connect a Supabase project and push the schema** ← SETUP.md
10. Ship checklist §7, with numbers. Mobile: run it on a device, not a simulator.

## §9 The phone

`apps/mobile` is Expo SDK 57 with expo-router. It shares everything worth
sharing with the web and draws it natively.

**What is shared**, all of it from `packages/core`: the string tables, the zod
schemas, the Markdown parser, the syntax highlighter, the progress arithmetic,
date and money formatting, the paths, and — since the phone came along — the
**palette** (`theme.ts`) and the **row→shape mappers** (`shapes.ts`). A course
card is assembled by one function for both platforms; only the client differs.

**Nothing in `packages/core` may import from `apps/*`**, or touch `next/*`,
`window`, `document` or a React Native module. It runs in three places.

### The three decisions that shape this app

1. **No NativeWind.** Styling is `StyleSheet` over the shared palette and type
   scale. The same reasoning that gave us our own highlighter: a dependency
   earns its place, and a second styling dialect that has to be kept in step
   with Tailwind's does not.
2. **The session lives in the keychain**, chunked across `expo-secure-store`
   entries because a Supabase session is larger than the 2KB that store accepts
   (`src/lib/storage.ts`). AsyncStorage is what most guides show and leaves
   refresh tokens in plain text.
3. **Paid courses are not sold in the app.** Apple's guideline 3.1.1 requires
   in-app purchase for digital content sold inside an iOS app, and Bonum is not
   that. A free course enrols in-app; a paid one sends the buyer to the website
   and opens the moment they come back. See docs/decisions #009.

### Things that bite

- **Metro and pnpm**: `watchFolders` must include the repo root and
  `nodeModulesPaths` both `node_modules` directories — but
  `disableHierarchicalLookup` must stay **off**. Every guide that turns it on is
  written for yarn; pnpm keeps a package's dependencies beside it, so walking up
  is the only way to reach them.
- **Fonts**: `pnpm --filter @jarvis/mobile test` reads the bundled Inter TTFs
  and fails if Ө ө Ү ү are missing. On a phone there is no fallback chain — a
  missing glyph is a blank box, not a different font.
- **Weight comes from the family name** (`Inter_500Medium`), and `fontWeight` is
  never set beside it, or Android synthesises a second bold on top of the first.
- The API routes on the web already accept a bearer token
  (`lib/supabase/server.ts` forwards it), so anything the phone cannot do
  through RLS alone can call them with `useAuth().session.access_token`.
