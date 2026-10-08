# TsStark Academy — online coding school

This file is the contract. When a prompt says "§4" or "§6", it means a section
here. If something in this document is wrong, or has become wrong, **fix this
file first, then the code.** Do not let the two drift.

---

## §1 What this is

A Mongolian-language school that teaches people to write code, with a secondary
English edition. Students work through video + written + coding lessons, and
their progress follows them between a laptop and a phone.

**It is a website, and only a website.** There was an Expo app — catalogue,
player, quiz, progress, account, all working — and it is gone, along with every
line that existed to serve it (decision #013). "Follows them between a laptop
and a phone" means the browser on both, which is what `.shell`, the tab bar and
the 360px check in §7 are for. If a request says "the app", it means this site.

**There is one price, and it buys everything, for good.** Five tracks —
Танилцуулга, Landing page, Fullstack website, iOS/Android, 2D/3D
тоглоом. «Кодын суурь» was a sixth and is deleted: it taught the pieces of a
language to a school that stopped teaching typing, and every other lesson that
pointed at it now points at Landing page instead. A course is **not sold on its own**: no screen shows a per-course
price, `/api/checkout` sells only the bundle, and `courses` has no price column
to read. Six prices is a decision somebody has to make before they have any way
of making it; one price is no decision at all, which is the point.

So a course says one thing about money — `courses.is_free`. Free means anyone
signed in may take it; anything else opens with the bundle. That flag is the
whole model: the free-enrolment RLS policy reads it, the card prints «Үнэгүй» or
«Багцад багтсан» from it, and the admin console offers a checkbox rather than an
amount.

**Right now nothing is free, and that is a setting rather than a rewrite.**
Танилцуулга was the free intro and is not any more: `is_free` is false on all
five, and `lessons.is_preview` — a _second_, separate door, which opens one
lesson to somebody who is not even signed in — is false everywhere too. Turning
one off and not the other is the version of this change that looks finished and
is not, so both are named here.

The flag stays because the model is still the right one and the decision is
reversible in one `update`. What is not reversible in one `update` is the
course's own prose: the intro's `description_mn` said «Энэ сургалт үнэгүй»
and would have gone on saying it under a card marked «Багцад багтсан». **A
claim about money lives in three places — the flag, the preview column and the
copy — and they have to be changed together.** `apps/web` needs no change for
any of it — **for copy that is keyed on the flag.** The hero renders a plain
kicker when no course is free, and the «үнэгүй үзэх» button simply stops
existing.

Copy that is _not_ keyed on the flag is the trap. This paragraph used to end at
"needs no change", and for weeks a student who had bought nothing was greeted on
«Сайн уу» by «Үнэгүй эхлэх», while the front page and «Бидний тухай» closed on
«Эхний сургалт бүхэлдээ үнэгүй» — three unconditional strings nobody re-read
because the flag had been turned off. So: **a string that is always rendered
never mentions «үнэгүй».** A string that says it is shown only behind
`is_free` or `is_preview`. `«Сайн уу»` with nothing open offers the bundle
itself, through `BundleButton`.

**A struck-through price is a price the school really charges.** It used to be
an anchor — 499,000₮, struck through above 199,000₮, a number nothing had ever
been sold at — and a buyer who suspects one number on the page was invented
stops believing the others. So the discount is now a **launch price with a real
end**: the launch price until the end of its last day (Ulaanbaatar's
calendar, inclusive), then the regular price.

**The price is set in the console, not in code.** It is one row,
`public.bundle_pricing` (20261005000100): `price_mnt`, `launch_price_mnt`,
`launch_last_day`. «Сургалтууд» in the admin opens with the form that edits it
(`PricingForm`); anybody may read the row, only `is_admin()` may update it,
and nobody may insert or delete — one row, enforced by a key that can only be
`true`. The table's `check`s refuse half a launch (a price with no day, or the
reverse) and a launch price that is not lower. This replaced three constants
in `packages/core`, whose own comment had said a sale run without a developer
would become "a row in a settings table". It is still one price for
everything — a column per course needs the ADR below, not this row.

`bundleOffer(pricing)` in `packages/core/src/offer.ts` turns the row into what
is charged now; `getBundleOffer()` in `lib/queries/pricing.ts` reads the row
and calls it. `/api/checkout` charges that `price` and every screen prints the
same object, so the struck number, the saving and «… хүртэл» cannot disagree
with the invoice. A row that cannot be read prints **no** price and checkout
refuses with 503 — never a default nobody set. **When the day passes, the
checkout charges the regular price and the strike, the saving and the date
disappear on their own.** A deadline that does not move the price is the same
lie as the anchor, only with a date on it. Extending the launch is changing
that one date in the console — and it has to be changed _before_ it passes,
not after.

**The size of the catalogue is not advertised yet.** Ten lessons and three and
a half hours, printed under «2D-ээс 3D хүртэл» as «20 мин», reads to a buyer as
"is that all". `SHOW_CONTENT_SIZE` (false) takes the lesson counts and running
times off the selling surfaces — the bundle panel, a course card and a course
page's header — and «Шинэ хичээл тогтмол нэмэгдэнэ»
stands where the totals were. Nothing is hidden from somebody who looks: a
course page's syllabus still lists every lesson with its minutes. Turn it back
on when the numbers argue for the school.

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

It was called **Jarvis** until this rename — every string a reader sees, and the
documents.

What did **not** change is the `@jarvis/*` workspace scopes. Nobody outside this
repository reads a package scope, and renaming them touches every import in
three packages to no one's benefit. If they are ever renamed it is a mechanical
change, not a decision.

- **One language: Mongolian.** It shipped bilingual and is not. A
  half-translated second edition doubles every copy change and shows somebody a
  screen in a language the rest of the product is not written in. `LOCALES` has
  one member, there is no switcher, and `/en` is nothing. The `_en` columns stay
  in the database, unread, because dropping them throws away translations
  somebody may still want.
- A bare URL goes to `/mn`, with a **308**. `Accept-Language` is not consulted
  and now could not be, so the redirect is a fact rather than a guess about the
  reader — and the default 307 had Google keep the bare domain in its index
  with `/mn` filed as a duplicate. Every public page also names itself as
  canonical (`pageMetadata`), which none did before 2026-10-06.
- Small team. One admin console, no roles beyond `student` and `admin`.

### Content model (settled — do not revisit without saying so)

```
course  →  module  →  lesson  →  quiz_questions
```

A lesson is **not** four different tables. One row carries any of four things,
because a real lesson is usually three of them at once: watch this, read the
notes, write the code, answer two questions. `kind` says what it leads with;
the columns say what it actually has.

| kind    | leads with    | must have                |
| ------- | ------------- | ------------------------ |
| `video` | the player    | `video_url`              |
| `text`  | the writing   | `body_mn`                |
| `code`  | the exercise  | `starter_code`           |
| `quiz`  | the questions | rows in `quiz_questions` |

The database enforces those three constraints (§5). A lesson with a video and
a body and an exercise is normal and needs no new kind.

**The school teaches directing, not typing.** Nobody writes code: a student
learns what the pieces are called, how to ask for them clearly, and how to
check what comes back. So a lesson body carries **no code blocks** — prompts go
in `>` quotes, and a `code` lesson kind would promise an exercise there is not.

**All six courses are now written this way**, and nothing in the seed carries a
code fence or a `code` lesson any more. The `code` kind stays in the enum and in
the table above because the constraint that guards it is still correct, not
because anything uses it — a course that wants an exercise back has to bring
`starter_code` with it.

**One fence is still allowed, and it is not code**: ```diagram parses to a
`diagram` block — one step per line, `Label | the note under it` — drawn as a
row of boxes, and as a column once the screen is narrow enough that a row would
scroll. It exists because a lesson body **cannot carry a picture**: there is no
image node in `parseMarkdown()` and there should not be one, since an image is a
file somebody has to keep in step with the prose in two places and translate
separately. A written diagram travels with the sentence that explains it.

`scripts/check-seed.mjs` enforces both halves of this — a body may open no other
fence, and may contain no `|` table row, because the renderer has no table node
and draws one as four pipes on the page. The intro course had one for months.
Nothing in Postgres or TypeScript can notice prose going wrong, which is why
that guard is a script and why it runs inside `pnpm test`.

The front page carries the same promise, and it is easy to break there without
touching a lesson: the hero line, the framed product shot under it, the topic
chip on a course card and that course's cover photo are each a claim about what
this school teaches. The shot showed a syntax-highlighted CSS rule, and
`fullstack` wore a React source screenshot, for exactly as long as nobody
looked.

**There is no handbook.** A course carried a PDF companion for a while: built
from HTML by headless Chrome, committed because the deploy has no browser, and
public on the argument that a stranger who downloads it and learns what a server
is has been taught something.

It is gone — two PDFs, their sources, the SVG diagrams, the two scripts that
drew and printed them, a route to read one, and the paragraph that used to stand
here. The lessons are the course. A second document
saying the same things in another medium is a second document to keep true every
time a lesson changes, and nothing in `pnpm test` could ever have noticed it
drifting.

If a printed companion is wanted again it comes back as a decision in
`docs/decisions/`, and that decision has to answer the question this one could
not: who rewrites it the week the course changes.

**No course ends with an exam.** Each used to: a final module «Шалгалт» holding
one `quiz` lesson of ten questions. All five are deleted — a ten-question test
between a student and the end of a course is a gate, and this school's job is to
get somebody to the thing they built, not to grade them on the way.

**A quiz inside a module is a different object and stays.** Four questions,
asked right after the lesson that warned about the mistake, marked in the
browser with the explanation as the second half of the teaching
(`QUIZ_PASS_SCORE` is still what marks it). None is in the seed right now —
the last, «Шалгалт: HTML ба CSS», went with the lessons it asked about when
Landing page became a single video — and more are welcome. The rule the seed
guard encodes is the distinction: four questions is a quiz, ten was an exam.

So the `quiz` kind stays, and so does the constraint Postgres cannot express —
questions live in another table, so a `quiz` lesson with none applies cleanly
and then opens as a page with nothing on it. `scripts/check-seed.mjs` refuses
that, and is wired into `pnpm test`.

---

## §2 Stack, commands, environment

| Concern  | Choice                                                                           |
| -------- | -------------------------------------------------------------------------------- |
| Monorepo | pnpm workspaces + Turborepo                                                      |
| Web      | Next.js **16** App Router, React 19, TypeScript strict                           |
| Styling  | Tailwind **v4** (CSS-first `@theme`, no `tailwind.config.js`)                    |
| Data     | Supabase — Postgres + RLS + Auth + Storage                                       |
| Payments | **Bonum** (MNT), live. No mock mode (§6.7, decision #015)                        |
| Video    | **Cloudflare R2**, public bucket. The app holds no R2 credential (decision #014) |
| Deploy   | Vercel, functions in **hnd1** (Tokyo) — beside the database, see below           |
| i18n     | Hand-rolled string tables in `packages/core` — **not** next-intl (decision #003) |
| Motion   | CSS transitions, plus one keyframe loop (`.marquee`). No animation library.      |
| Visitors | **Vercel Web Analytics**, cookieless — read in Vercel, linked from the console   |

```bash
pnpm dev              # turbo dev — web on :3001
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
without it `localhost:3001` answers **HTTP 431** — _Request Header Fields Too
Large_ — and it does so from inside Node's HTTP parser, before Turbopack, the
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

`www.tsstark-academy.com` is not exposed to this: on a real domain the jar is ours alone,
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
   Next does not. The dying server flushes this manifest _after_ the new one has
   written it. `sleep 2` is not enough — wait for the process to be gone.

```bash
pkill -f "next dev"
while pgrep -f "next-server" >/dev/null; do sleep 1; done
rm -rf apps/web/.next && pnpm dev:web
```

Deleting `.next` alone does not help if the race repeats on the way back up,
which is why the wait is the part that matters.

### The functions run where the database is — `hnd1`

Supabase lives in **ap-northeast-1** (Tokyo). Vercel put the functions in its
default, **iad1** (Washington), and every page paid for it: `x-vercel-id` read
`hkg1::iad1` — the reader's request crossed the Pacific to reach the function,
and then every Supabase call (the session in `proxy.ts`, `getViewer()`, the
page's own queries, one after another) crossed it again. Measured from Ulaanbaatar
on 2026-10-05 the document took **1–2.4 s** to start while the server reported
60 ms of work; Lighthouse put both front page and course page at an LCP
over 3 s for that reason alone.

`apps/web/vercel.json` pins `"regions": ["hnd1"]` (`apps/web` is the Vercel
project's root directory). **The region follows the database, not the
reader** — a page makes several sequential queries and one round trip to the
reader, so the queries are the distance to shorten. If Supabase ever moves,
this moves with it.

### Environment

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=    # safe in a browser bundle; RLS protects the data
SUPABASE_SECRET_KEY=                     # server-only, bypasses RLS. NEVER NEXT_PUBLIC_
NEXT_PUBLIC_APP_URL=
GOOGLE_CLIENT_ID= GOOGLE_CLIENT_SECRET=  # §6.6 — server-only; both unset = Supabase's redirect
BONUM_API_BASE_URL= BONUM_APP_SECRET= BONUM_TERMINAL_ID=   # §6.7 — Vercel Production only
BONUM_MERCHANT_CHECKSUM_KEY= BONUM_CALLBACK_URL=
```

`SUPABASE_SECRET_KEY` is read in exactly one file —
`apps/web/src/lib/supabase/server.ts` — and that file starts with
`import "server-only"`. There is exactly **one** legitimate caller of
`createServiceSupabase()` in production: the Bonum webhook, which has no session
and has to settle an invoice for a buyer who is not making the request.

There used to be a second: `/api/checkout` settling its own invoice in **mock
mode**, guarded by `NODE_ENV !== "production"`. The guard was sound and the
premise was not — it assumed a laptop has a database of its own, and this one
is pointed at the live project, so every "test" purchase opened every course in
production for nothing (decision #015). It is gone. Anything else reaching for
the service client is a bug, including "the type checker was easier this way" —
and a second caller has to arrive with an ADR, not a guard.

**Every variable must also be listed in `turbo.json`'s build `env` array.**
Turborepo 2 runs builds in strict env mode: a variable missing from that list is
not passed to the build however carefully it was set on Vercel, _and_ is not part
of the cache key — so a build can be restored from a cache made with a different
value and nobody is told.

### Credentials the site does not have

Three things talk to services the _app_ never talks to, and their credentials
live in a gitignored `.env` **at the repo root** — not in `apps/web/.env.local`,
not in `turbo.json`, not in Vercel:

```
SUPABASE_ACCESS_TOKEN= SUPABASE_PROJECT_REF=   # scripts/supabase-setup.mjs
CLOUDFLARE_ACCOUNT_ID= CLOUDFLARE_API_TOKEN=   # scripts/upload-video.mjs
R2_BUCKET= R2_PUBLIC_BASE=                     #   (both optional)
```

`scripts/env.mjs` is what reads that file, and the real environment beats it, so
a token nobody wants on disk can be passed per command.

**The video half is the interesting one.** Lesson films live in Cloudflare R2
(decision #014), and yet no R2 name belongs in the build's environment — because
`lessons.video_url` holds an **absolute URL** and the player is a plain
`<video src>`. Nothing at request time has to know where the file is. A
`NEXT_PUBLIC_R2_BASE` would be the obvious design and is the worse one: it puts
media hosting into the contract above, where a missing variable is invisible by
design. The price is that changing host means rewriting the column —
`pnpm video:upload <file> <lesson-slug>` does that for one lesson, in
`supabase/seed.sql` and in the live row, and SETUP.md §11 is the rest.

R2's bucket is public, which is a decision and not a shortcut: read #014 before
changing it. The short version — `lesson_outline` does not project `video_url`
and the `lessons` policy hands it only to a preview lesson or a buyer, so you
must have paid to _learn_ the URL; what is given up is the step after that.

---

## §3 Layout

```
apps/web            Next.js 16 — the site and the console
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
legal; it is the _code_ that is capped. Never delete a comment to get under the
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

Not ESLint's `max-lines`: lint runs in `apps/web` alone, so `packages/core`,
`scripts/` and `supabase/` would have been exempt by accident rather than by
decision.

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
app/[locale]/(app)/         signed in only: «Сайн уу» (the trail and the project
                            showcase), dashboard, my courses, «Чат» (the live
                            chat room), settings
app/[locale]/(study)/       the course screen and the lesson player
app/[locale]/(auth)/        sign-in, sign-up
app/[locale]/(admin)/       the console
app/api/                    checkout, the Bonum webhook
app/auth/                   confirm (Supabase's redirect, email links) and
                            google (our own Google callback, §6.6) — no locale
components/{ui,layout,course,lesson,admin,app,ask,auth,dashboard,home,settings,site}/
lib/{supabase,queries,actions}/  lib/auth/  lib/bonum.ts  lib/seo.ts  lib/locale.ts
```

**Four shells, and the split is deliberate.** `(site)` is for somebody deciding
about the product; `(app)` is for somebody who already decided, and it carries
the student's own five destinations rather than the site header's eight.
`(study)` is separate from `(app)` because a lesson already has its own syllabus
column — a second navigation beside it would squeeze the thing the reader came
for. The groups do not appear in the URL, so `/mn/learn` and
`/mn/learn/react-next/state` live in different shells at the same path prefix.

**The signed-in navigation is a tab bar**, the shape a phone browser already
expects. One array
of links in `components/app/nav.tsx`, drawn two ways: a **fixed bar along the
bottom** below `lg`, inside the thumb's reach and never scrolled away, and a row
in the top bar above it, because a bottom bar on a 27-inch screen puts the
navigation as far from the content as the geometry allows. Both shapes come from
the same component, so a link cannot exist on one and not the other. The tab bar
pads itself by `env(safe-area-inset-bottom)` and `main` reserves `pb-24`, or the
last line of every page sits under it.

Labels come from `t.nav.tab.*` — short forms written for a 72px-wide tab.
Truncating «Миний сургалт» would leave a beginning, not a name.

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
carries two layouts: a winding column on a narrow screen, one horizontal track
on a wide one, both drawing the same node so they cannot drift.

**The shell follows the reader, not the URL.** A signed-in person never sees the
marketing chrome: `(site)/layout.tsx` renders `AppShell` — the same rail `(app)`
uses — the moment `getViewer()` returns somebody. The catalogue, a course page,
about, contact and checkout are public _because a stranger must be able to read
them_, not because a student should be thrown back out to the sales bar every
time they open the catalogue from their own rail. So `components/layout/header.tsx`
knows nothing about sessions — it only ever renders for somebody who has none —
and inside the product the wordmark goes to the dashboard, never to `/`.

The front page is the exception and handles itself: it redirects a signed-in
visitor to `landingPath()` before any of this matters — which is why a link to
`/` from inside the product is a link that bounces straight back to where it
was clicked.

**The admin rail's only way out is «Гарах».** It carried a "view site" link
once; that went, because the console is somewhere the team is _working_ and a
link back to the shop floor is a way to lose your place mid-edit. Previewing a
course still has its own link, on that course's row, where the thing being
previewed is unambiguous. `t.admin.nav.viewSite` is that row's label and is
still used — it is the rail-level version that is gone.

**«Тохиргоо» is a section with categories, not one form.**
`(app)/account/layout.tsx` owns the column and draws `SettingsNav` — groups in a
column beside the page on a laptop, one scrolling row of pills on a phone, both
from one array. `/account` is the profile form, the password and the way out, `/account/help`
is the school's channels and the feedback form, and the terms and the privacy
policy follow at `/account/terms` and `/account/privacy`.

**Help is not a tab.** It was a fifth one, pointing at the public contact page;
it moved into settings because what a student needs help with is nearly always
their account. `ContactChannels` draws the channels in both places, so the
public `/contact` (for a visitor) and `/account/help` cannot list different
inboxes.

Those two documents exist at two URLs **on purpose**. The public `/terms` and
`/privacy` are for a stranger deciding whether to sign up, and the footer links
there; the copies in settings are where a student looks for "what do you keep
about me", because the app rail has no footer. Both render `LegalDocument`
from the same string table, so they cannot disagree, and the settings copies are
`noindex`. Do not "deduplicate" them into one. A new category is one entry in
`buildGroups()` and one route under `account/`.

**There is no `app/layout.tsx`.** `app/[locale]/layout.tsx` is the root layout,
and that is load-bearing rather than a preference: `next/root-params` only
exposes segments sitting _above_ the root layout, which is what lets any server
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
there is no `data-theme` attribute, no `light:` variant and no toggle in the
header. The palette below is **the** palette. If a light edition is ever wanted, it comes back as a decision in
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
  single source of the palette — `@layer base` rules and inline `style`
  attributes both read these names, and only a custom property can be named
  from both. (A third reader used to exist: `packages/core/src/theme.ts` held
  the palette as data for the phone, kept honest by a drift test. Both went
  with the app — §9 — so the palette now has exactly one home, which is the
  stronger version of the same rule.)
- `@theme inline { --color-panel: var(--panel); … }` maps Tailwind's utility
  names onto **references**, so `bg-panel` and `background: var(--panel)`
  resolve to the same declaration rather than to two copies of a hex that
  drift. A plain `@theme` would bake today's value into every utility.

**Any token that is only ever named from an inline `style` must live in
`:root`, never in `@theme`.** Tailwind v4 tree-shakes a theme variable that no
_emitted rule_ mentions, and the class scanner cannot see a TSX `style`
attribute. That is why `--tint-*` (topic chips), `--viz-*` (charts) and
`--avatar-*` (the student avatar's gradient stops) are in `:root`. Put them in `@theme` and every chip renders the same colour.

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
HTML string. Shiki, Prism and highlight.js all return HTML, and an HTML string
has to be injected with `dangerouslySetInnerHTML` — a hole opened on every
lesson page to render something we generated ourselves. Shiki's WASM grammar
engine is also a heavy thing to start inside a serverless request. Tokens are
rendered as spans coloured by `--tok-*`, one set, chosen against the near-black
code ground. It is a lexer, not a parser, which is the right trade for teaching
snippets of ten to forty lines.

The same reasoning gives us `parseMarkdown()`: a lesson body parses to a small
typed tree that the renderer walks. Between them there is **no
`dangerouslySetInnerHTML` anywhere in this codebase**, which is the property
worth keeping.

(Both were also written so an Expo app could draw the same snippet with `<Text>`
runs. That app is gone — decision #013 — and neither choice depended on it.)

---

## §5 Data model

See `supabase/migrations/`. Tables: `profiles`, `courses`, `modules`, `lessons`,
`quiz_questions`, `enrollments`, `lesson_progress`, `payments`, `feedback`,
`projects`, `chat_messages`, `chat_authors`, `teacher_emails`.

`chat_messages` is «Мэдэхгүй зүйлээ асуу»: one room, live through Supabase
Realtime (`postgres_changes`, the only read a client component makes — writes
are still server actions).

- **The room is part of what the bundle buys.** It is open to a student with a
  live enrolment that was paid for (`purchase`, or the console's `grant`), to a
  teacher and to the team — `is_chat_member()` (20261004000100), and nobody
  else. `free` does not count: taking a free course is not having paid (§1).
  The `chat_read` and `chat_insert` policies call that function and so does the
  page, which shows anybody outside the same box closed — `ChatLocked`, with
  the bundle's button — and reads no messages for them. The tab stays in the
  nav for everybody: a closed door with the way in written on it sells the room
  better than a missing one.

- **Who wrote a message is in another table.** A Realtime event delivers the
  whole row to every browser in the room, so `chat_messages` carries only what
  the room may read — the words, the printed name («Б.Тэмүүлэн», copied in by
  the insert trigger) and `is_team` — and the author's id lives in
  `chat_authors`, readable only by that author. Column grants on one table were
  rejected: whether Realtime honours them is an internal detail, and when it
  does not, the failure is silent. A table with nothing to hide needs no such
  detail. `is_mine` on the first screen comes from asking `chat_authors` about
  those ids; afterwards the browser knows its own by the ids it sent.
- **The trigger is the author.** It takes `auth.uid()`, never a client value,
  overwrites the name and team flag from `profiles`, and refuses an eleventh
  message in a minute (`chat_rate_limit`). Insert is granted on `body` alone.
- **«Багш» is a list, not a role.** `teacher_emails` (the `admin_emails`
  shape, §5: writable by no API) names who answers with a teacher's mark; the
  trigger copies `is_teacher` onto each message, and the room draws it apart —
  accent rule, ring and badge. A teacher need not be an admin. Adding one is
  `insert into public.teacher_emails (email) values ('…')` in the SQL editor;
  their earlier messages keep the old flag unless updated by hand.
- **Delete, never edit:** your own, or the team's on anybody's. Times print in
  Ulaanbaatar's clock (`formatClock`), so the server's render and the
  browser's agree without `Intl` (§6.5).
- **The console moderates from a list.** `/admin/chat` («Чат» in the rail)
  shows every message newest first — author, day and time, the words — with
  a delete on each. It is the same `chat_delete` the room uses, through the
  admin's own session (`removeChatMessage`); Realtime takes the message out of
  every open room as soon as it is gone.

`projects` is «Миний төслүүд»: the address of what a student built, with an
optional name and description. **It belongs to the student, not to a course** —
there was a course picker, filing one project under each track, and it is gone
(20261002000300). Anybody signed in may post — holding a course is not
required — and keeps up to ten; `PROJECT_LIMIT` in core and a trigger in the
database say the same number. A student keeps it
on their dashboard; **every signed-in student** reads everybody's on «Сайн уу»
— the showcase that replaced the long guide there — and the team reads them at
`/admin/projects`.

- **Classmates read the view, never the table.** `project_showcase` is
  owner-invoked like `lesson_outline` (§5.1), because the author's name lives
  on `profiles` beside their phone and email. It gives out a first name and the
  initial of the овог («Б.Тэмүүлэн», `authorName()` in core), `is_mine`, and
  nothing else about the person — no `user_id`. Signed in only; anon has no
  grant.
- **The URL is an `href` on three screens**, so it is checked by one rule —
  `normalizeProjectUrl()` (the form and the action) — and a `check` on the
  column (everybody else). Only http and https, no credentials, a real domain.
  Rendered with `rel="noopener noreferrer nofollow ugc"`.
- **The team can take a link down and never rewrite it.** A link everybody
  opens has to be removable by somebody other than its author; a description
  changed by somebody else is no longer the student's own words.
- **Every student wears the same picture** (`StudentAvatar`), not the photo
  Google hands over.

Three things that are decisions rather than details:

1. **`user_id` references `public.profiles`, never `auth.users`.** Same rows
   either way, but `auth.users` is not in the exposed schema, so PostgREST
   cannot see a relationship to it — and every screen that shows _who did
   something_ needs that join.
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
admin **on the server** → write through the _request-scoped_ client so RLS
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
a prerender they throw a _signal_ meaning "this route is dynamic". Swallowing it
prerenders the page as if nobody were signed in — and every visitor is then
served one build's worth of "you have no courses" from the CDN.

### 6.5 Formatting without `Intl`

`packages/core/src/format.ts` formats dates and money by hand. The reason is
hydration: `Intl` data differs between Node and a browser engine, so the server
and the client can render the same date differently and the page looked fine
while being wrong. A second reason applied to an Expo app that no longer exists
(Hermes ships without full ICU on Android, and `Intl.DateTimeFormat("mn-MN")`
returned an English-looking date there) — the first one alone is enough.

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
- **Google returns to our own domain, not Supabase's.** Through Supabase's
  OAuth redirect, Google's account chooser said «to continue to
  dhdrcjhrznkgdizkuolo.supabase.co», because Google names the domain the
  sign-in returns to; Supabase changes that only with a paid custom domain. So
  `signInWithGoogle` (`lib/actions/google.ts`) sends the browser to Google
  itself, Google returns to **`/auth/google`**, the code is traded for an ID
  token server to server (`lib/auth/google.ts`), and Supabase is handed that
  token with `signInWithIdToken` — which still verifies signature, audience
  and nonce. State, nonce and the PKCE verifier ride in one HttpOnly cookie
  scoped to the callback, good for ten minutes and one trip.
  - It needs `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (the same OAuth
    client Supabase's Google provider uses), and **both callback URLs on that
    client's redirect list** in Google Cloud Console:
    `https://www.tsstark-academy.com/auth/google` and
    `http://localhost:3001/auth/google`. Add the URLs **before** setting the
    keys anywhere: with the keys and without the URL, Google answers
    `redirect_uri_mismatch` and nobody can sign in with it.
  - **`pnpm google:keys` is how the keys go in.** It asks for the secret with
    the echo off, tries the pair against Google's token endpoint, and writes
    Vercel Production and `apps/web/.env.local` only when Google accepts it —
    the `bonum:keys` shape, sharing `scripts/secrets.mjs`. Until 2026-10-05
    the laptop held the hash below and Vercel held no Google key at all, so
    the chooser still said `supabase.co` everywhere while this flow sat
    written and unused.
  - **The secret comes from Google Cloud Console, never from Supabase.** The
    Management API's `GET /config/auth` answers `external_google_secret` with
    a 64-character SHA-256 **hash** of the secret, which looks like a value and
    is not one: set as `GOOGLE_CLIENT_SECRET`, Google refuses the code exchange
    with `401 invalid_client` and the sign-in page says only «Google-ээр
    нэвтэрч чадсангүй». A real one starts `GOCSPX-`. `lib/auth/google.ts` refuses a
    64-hex value outright — it is treated as unset, with a warning in the
    log, so a pasted hash degrades to the Supabase redirect instead of
    breaking sign-in.
  - **Diagnosing it:** every refusal on this path logs one `[auth]` line —
    the Google error name, never the code or the secret — and `next dev`
    keeps them in `apps/web/.next/dev/logs/next-development.log`.
  - Without the keys, or on an origin Google would not accept (a Vercel
    preview), `googleDirect()` says no and the old path runs: Supabase's
    redirect through `/auth/confirm`, where `@supabase/ssr` keeps the PKCE
    verifier in the same cookie jar it reads back from.
- **`next` is validated before it is used, by one function:** `safeNextPath()`
  in `packages/core/src/courses.ts`. Only a path on this site — an absolute URL
  there would make the sign-in button an open redirect. "Starts with `/` and
  not `//`" was the rule and was not enough: browsers read a backslash in a
  `Location` header as a slash, so `/\evil.com` went to another site through
  the password form. The second character may be neither, and the path may
  carry no backslash or control character. Never re-implement it inline.
- **A redirect Supabase will not allow is not refused — it is replaced by
  `site_url`.** So the failure never says "not allowed"; it says whatever
  `site_url` says. Read that as "the allowlist rejected my redirect", not as
  "the site is down".
- **The allowlist entries carry `/**`, and that is load-bearing.** Sign-in never
  asks for a bare `/auth/confirm` — it asks for `/auth/confirm?locale=mn`, plus
  `&next=…` when somebody asked for a destination. An entry written as the exact
  callback path never matches that, so every redirect quietly took the
  `site_url` branch above. The symptom is the diagnosis read backwards:
  **signing in at `localhost:3001` landed on the production domain**, because
  that is what `site_url` is, and on the deployed site the same broken match
  landed correctly and hid the fault for as long as nobody worked locally.
  `scripts/supabase/auth.mjs` holds the list; `node scripts/supabase-setup.mjs
--auth` pushes it without touching the seed.
- **Where a new session goes is one function**, `destinationAfterSignIn()` in
  `packages/core/src/courses.ts`, and all four doors call it: the password
  form, the sign-up form, `/auth/google` (our own Google callback) and
  `/auth/confirm` (Supabase's Google redirect, the fallback, and every email
  link) — the two routes through `landingAfterSignIn()` in
  `lib/auth/session.ts`. It honours an explicit `next` — "sign in to buy this course" —
  but only a path on this site, and **never the marketing page**: signing in
  from the front page sets `next` to the front page, and landing back on the
  pitch is the one destination somebody who just signed in cannot have meant.
  Otherwise `landingPath()` decides from the role: the team to the console,
  everybody else to their dashboard.
- **Each door must _read_ the role, never assume it.** All four do, through
  `roleOfCurrentUser()` in `lib/auth/session.ts` — server-only rather than in
  a `"use server"` file, because a route handler importing from one would turn
  the helper into a public action. It is
  read from `profiles` rather than from the token because a role granted a
  moment ago is in the table straight away and in the JWT only after it
  refreshes — and the owner's role is granted by `handle_new_user()` during the
  very sign-up that is about to redirect. `signUp` passed a literal `"student"`
  for a while, which sent the one account that runs the school to a student
  dashboard and made the owner allowlist look broken.
- **Changing a password checks the current one by signing in with it**
  (`lib/actions/password.ts`) — Supabase has no verify call, and the attempt
  counts against the sign-in rate limit, so the form is no faster a way to
  guess. It is a check, not a wall: the session cookie is readable in the
  browser and can ask Supabase for a new password directly. An account with no
  `email` identity — Google only — has no password, and sees a line saying so
  instead of the form.
- **The mark is Google's.** `GOOGLE_MARK` in `packages/core` holds the
  four-colour path data, drawn unrecoloured. It is the only place in this
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

**There is no mock mode** (decision #015). A course opens on a signed Bonum
callback and nowhere else — not on a laptop, not "just to test the flow".

**`settle_payment()` is executable by `service_role` alone**, and its own
migration (20261004000200) refuses to apply otherwise. It checks nothing about
its caller, so the grant is the whole gate — and until that migration, `anon`
and `authenticated` held it through Supabase's named default grants: any
student could start a checkout, read back their invoice id and settle it
themselves from the browser console. A `security definer` function that moves
money gets its grants asserted, not assumed.

**Where it is configured.** The five `BONUM_*` values live in Vercel's
**Production** environment as Secret-type variables, so nothing — not
`vercel env pull`, not the dashboard — can read them back. The merchant panel
(merchant.bonum.mn → Мерчант → Web Hook) carries the same callback URL,
`https://www.tsstark-academy.com/api/webhooks/bonum`, as `BONUM_CALLBACK_URL`;
each invoice also sends it, and `settle_payment()` being idempotent is what makes
two deliveries harmless.

**A deployment without the keys sells nothing, and writes nothing.**
`paymentsConfigured()` is asked before the `payments` row is inserted; without
the three credentials `/api/checkout` answers 503 with a sentence the button
shows. That is what a Vercel preview — or a laptop without the keys — does,
by design.

**Localhost takes real payments too**, because the owner tests purchases
there exactly as on the live site. `pnpm bonum:keys` writes the live keys into
`apps/web/.env.local` as well as Vercel, with `BONUM_CALLBACK_URL` pointing at
**production's** webhook: Bonum cannot reach a laptop, and production verifies
the callback and settles the row in the one database both share. A checkout
started on a laptop adds its port to `?to=` (`mn:<paymentId>:3001`), and the
webhook's GET sends the payer back to `http://localhost:<port>` — only ever
localhost and only a number, never a host from the query. A purchase on
localhost is real money; `bonum.ts` says so in the dev log.

**The payer comes back to the checkout page for their own payment.** `?to=`
on the callback carries `locale:paymentId`; the webhook's GET sends the browser
to `/checkout?payment=…`, which polls until the POST has settled the row. It
carried `locale:/mn/learn` for a while and read the path as a course slug —
`/mn/courses//mn/learn`, a 404 for everybody who had just paid.

To try a purchase, buy on www.tsstark-academy.com with a real card. The
admin console's payments screen and the panel's «WebHook Жагсаалт» both show
what happened.

---

## §7 Ship checklist

**Correctness** — `pnpm build` clean, `pnpm typecheck` clean, `pnpm lint` clean,
`pnpm test` clean — which includes the seed guard and the 160-line cap (§3.1) —
no `console.log`, no unused dependency, no placeholder copy on a public route.

**Security** — grep `.next/static` for the secrets: `SUPABASE_SECRET_KEY`,
`GOOGLE_CLIENT_SECRET`, `BONUM_APP_SECRET` and `BONUM_MERCHANT_CHECKSUM_KEY`. `is_admin()` reads
`app_metadata`. RLS on every table; anon cannot read a paid lesson and cannot
write. Every action zod-validates and re-checks admin. Storage denies anonymous
writes.

**Mongolian** — Ө ө Ү ү render in the webfont, not a fallback. Dates are
`2026 оны 9-р сарын 11`. No justified text, no uppercased Cyrillic.
`<html lang>` matches; fallback blocks carry `lang="mn"`.

**Layout** — no horizontal scroll at 360 on any route (measure it). Front page
and one lesson page checked at 360 / 768 / 1440.

**Performance** — Lighthouse mobile ≥ 90 performance and accessibility on the
front page and one course page. On a course page and the catalogue the LCP
element is the first course cover, and it is the only `priority` image. The
front page carries no course covers — its LCP is the headline — so nothing on
it is `priority`.

---

## §8 Build order

0. Monorepo, tokens, fonts, Supabase clients ✅
1. Schema, RLS, seed, types ✅
2. Query layer ✅
3. Public site — landing, catalogue, course page ✅
4. Auth — sign-in, sign-up, account ✅
5. The player — video, markdown, exercise, quiz, progress ✅
6. Admin — dashboard, course/lesson editors, students, payments ✅
7. Payments — Bonum checkout, webhook, live keys on Vercel ✅
8. **Connect a Supabase project and push the schema** ← SETUP.md
9. Ship checklist §7, with numbers — on a real phone's browser, not just a
   narrowed window.

## §9 There is no phone app

`apps/mobile` was an Expo app — catalogue, course, player, quiz, progress,
account — and it is **deleted**, along with everything that existed only to
serve it: the Expo workspace and its lockfile entries, pnpm's `publicHoistPattern`
for React Native, the three `EXPO_PUBLIC_*` names in `turbo.json`'s build
environment, `packages/core/src/theme.ts` and its drift test, the `dev:mobile`
script, and the `tsstark://` and `exp://` redirect entries in Supabase.

**Nothing in this repository should assume a second client again.** A feature is
finished when the website does it. If a review, a skill or an old comment says
otherwise, that text is stale — fix it rather than building to it.

The reasoning is decision #013. The short version: an app that ships is a second
product, every lesson-shaped change owes it a screen, and `pnpm test` can never
see it drifting.

**Two things that look like leftovers and are not:**

- **The iOS/Android course.** The school teaches building mobile apps and sells
  that track inside the bundle. Its lessons, its cover and
  `components/home/visuals/mobile.tsx` all stay. Deleting a _product_ because we
  stopped shipping _an app_ would be a different decision.
- **`packages/core`.** It was built as the seam between two clients, and its
  rule — nothing from `apps/*`, no `window`, no `document`, no `next/*` — still
  earns its place: it is what lets the plain-Node runner in `packages/core/test`
  check this code without a bundler or a browser.
