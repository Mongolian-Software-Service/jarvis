# Decisions

The short record of choices that are expensive to reverse. Add one when you make
a call somebody could reasonably make differently; say what you chose, what you
gave up, and what would change your mind.

---

## 001 — Supabase Auth, RLS as the authorization layer

**Chose:** Supabase Auth with the session in cookies, and Postgres RLS as the
real gate. Application code re-checks, but never decides alone.

**Gave up:** the freedom to put a clever access rule in one place in TypeScript.
Every rule now has to be expressible as SQL a policy can run.

**Why:** the publishable key is in every browser bundle, so PostgREST will hand
out anything the policies allow. A check that lives only in a React component is
a check that does not exist.

---

## 002 — Row-level security cannot hide a column, so `lesson_outline` exists

**Chose:** an owner-invoked view over published courses that projects away every
paid column. The syllabus reads the view, the player reads the table.

**Gave up:** one place to look. A lesson's shape is now described twice.

**Why:** a course page has to list every lesson to somebody who has not paid,
while the bodies, videos and solutions stay behind the policy. RLS is row-level;
the two cannot be separated on one table by a policy alone. Column-level grants
plus an RPC would also work and are harder to read.

**Would change it:** if lessons ever need per-row visibility rules the view
cannot express.

---

## 003 — Hand-rolled i18n, not next-intl

**Chose:** typed string tables in `packages/core/src/strings`, with the English
table annotated as the Mongolian table's shape so a missing key fails to
compile.

**Gave up:** ICU message formatting, plurals, and next-intl's routing helpers.

**Why:** `apps/mobile` cannot use next-intl, and copy that lives in the web app
is copy the phone has to duplicate. Mongolian has no plural agreement of the
kind ICU exists for, so the loss is smaller here than it would be elsewhere.

---

## 004 — Our own Markdown parser and syntax highlighter

**Chose:** `parseMarkdown()` returns a typed block tree; `highlight()` returns
lines of tokens. Each platform renders them.

**Gave up:** CommonMark completeness, and the accuracy of a real TextMate
grammar.

**Why:** every library in this space returns an HTML string, which is useless to
React Native and forces `dangerouslySetInnerHTML` on the web. Shiki's WASM
grammar engine is also a heavy thing to start inside a serverless request. For
teaching snippets of ten to forty lines, a lexer is enough.

**Would change it:** if lessons need tables, footnotes or embedded HTML, extend
the parser and both renderers rather than swapping in a library that only one
platform can use.

---

## 005 — Dates and money are formatted without `Intl`

**Chose:** a hand-written formatter in `packages/core/src/format.ts`.

**Gave up:** locale coverage we would get for free.

**Why:** `Intl` data differs between Node and browser engines, which shows up as
a hydration mismatch on a page that looked fine; and Hermes ships without full
ICU on Android, so `Intl.DateTimeFormat("mn-MN")` silently returns an
English-looking date on the phone. Two locales are cheap to write by hand.

---

## 006 — Money is integer tögrög

**Chose:** `integer`, suffixed `_mnt`, everywhere.

**Why:** MNT has no minor unit in practice, so there is nothing to divide by 100
and no reason to let a float near a price.

---

## 007 — The payment effect lives in the database

**Chose:** `settle_payment()` marks the invoice and creates the enrolment in one
transaction. The webhook only authenticates and forwards.

**Gave up:** being able to read the whole flow in TypeScript.

**Why:** money taken with nothing unlocked is a support call, and a serverless
function killed between two statements is exactly how it happens. The function
is also idempotent, which a route handler would have to reimplement for every
gateway retry.

---

## 008 — The visual language is Linear's, measured not remembered

**Chose:** the design language of linear.app — near-black cool ground
(`#08090a`), one typeface (Inter), type at weight 510 rather than bold,
translucent hairlines, and 32px pill controls whose primary state is a
near-white pill carrying no colour.

**Gave up:** a look of our own, and the two-face pairing (Manrope + Golos Text)
the site started with.

**Why:** it was asked for directly, and it is a good fit — a coding school's
readers spend their day in exactly this kind of interface. The values were taken
off the live site's computed styles rather than from memory, which is how the
weight scale (400/510/590, never 700) and the 13px control text got in; those
are the details that carry the resemblance, and they are the ones a from-memory
version always gets wrong.

**Kept from the old design:** the Mongolian typesetting rules (§4.3). Leading
stays at 1.6/1.75 rather than Linear's 1.5, because Cyrillic closes up; and the
`cyrillic-ext` requirement survived the font change — it is correctness, not
taste, and Inter satisfies it.

**Would change it:** nothing about this is load-bearing for the product. If the
school wants its own identity later, the tokens are all in one file and the
weight scale is three lines of `@theme`.

---

## 009 — There is no phone app _(superseded by #013)_

This recorded how `apps/mobile` was built — `StyleSheet` over a shared palette
rather than NativeWind, purchases sent to the website rather than IAP, the
session chunked into the keychain. **The app is gone (#013) and none of that
guidance applies to anything.** The entry stays, empty, because renumbering the
ones after it would break every reference to a decision by number.

---

## 010 — One theme, and it is dark

**Chose:** the dark palette is the only palette. No `data-theme` attribute, no
`light:` variant, no toggle in the header, no theme cookie — and one
`theme-color`. (It also named a theme row in the phone's settings; there is no
phone any more — #013.)

**Gave up:** a reader who prefers a light interface, and the daylight-on-a-train
case.

**Why:** a second theme is not a second set of hex values. It is a second set of
contrast decisions for every chart series, tint and token colour, a control that
has to be correct on the first frame, a cookie the server reads to avoid a
flash, a `theme-color` that has to follow it, a palette that has to exist twice
more for the phone, and a line in the ship checklist that doubles the surface of
every visual change forever. All of it to serve a reader who is already looking
at a dark editor. The one-theme version deletes a component, a lib file, a
cookie, a strings block, a settings row and a whole column of review.

**Gave up little else:** the light values were measured honestly and checked
against their own surfaces, so this was not a bad theme being retired — it was a
good one that nobody was going to keep honest as the product grew.

**Would change it:** a real complaint from real students, in numbers. If it
comes back it comes back as this file's #011 and as a second block in
`globals.css` plus a second `Palette` in `packages/core` — not as a quiet
attribute somebody adds mid-feature.

(This used to end by naming `packages/core/test/theme.test.ts` as the guard.
That test compared the phone's copy of the palette against `globals.css`, and
it went with the phone — #013. The palette now exists once, in CSS, which is
the stronger version of the same guarantee: there is no second copy to drift.)

---

## 011 — One price for everything

**Chose:** the catalogue leads with a bundle — five courses, one payment, held
for good — implemented as `payments.course_id = null` and a `settle_payment()`
branch that enrols the buyer in every published course.

**Gave up:** per-course revenue signal, and the ability to discount one track.
Also the simplicity of `course_id` being NOT NULL.

**Why:** five prices is a decision a beginner has to make before they have any
way of making it — they do not yet know whether they need "Кодын суурь" or
"Landing page". One price removes the decision, and the five cards below the
offer become _what you get_ rather than _what to choose between_. It also makes
the tracks free to reorganise: splitting a course in two costs the buyer
nothing, so the curriculum can follow what teaches best rather than what sells.

That freedom has since been used, which is why "Кодын суурь" above names a
course that no longer exists: it was deleted outright (CLAUDE.md §1), and
because nothing was ever sold separately, no buyer lost anything they had paid
for. The example is left as written — it is what the argument looked like at
the time, and the deletion is the argument being right.

**Why not a `products` table:** it would be the honest general model, and it is
three tables and a join for a product with exactly one bundle in it. `course_id
= null` says the same thing in one migration, and the day there is a second
bundle is the day to pay for the general version.

**What is not handled:** a course added after somebody buys is not granted
retroactively — `settle_payment` enrols in what is published at the moment the
money lands. `grant_all_courses()` exists for the console to do it by hand. If
the school promises "and everything we add later", that promise needs code.

---

## 012 — A course has no price of its own

**Chose:** `courses.price_mnt` is dropped. A course carries `is_free` and
nothing else about money: free means anyone signed in may take it, and
everything else opens with the bundle. `/api/checkout` sells only the bundle,
and no screen prints a per-course amount.

**Gave up:** the fallback #011 kept — buying one track on its own — and with it
any future A/B of a single price against the bundle without a migration. Also
the admin's ability to price a course, which is now a checkbox.

**Why:** #011 left both models standing, and the two disagreed in public. Six
cards priced 0–299,000₮ summed to 1,245,000₮ under a panel advertising 199,000₮
against a 499,000₮ anchor; a buyer who added the cards up found a third number
nobody meant. Worse, the endpoint would still have sold one course for 299,000₮
— more than all six — to anybody who posted `{course_id}` at it. A price column
nothing charges is not harmless: it is a number the next reader believes.

**Why a boolean, not a `0` price:** keeping the column and agreeing never to
charge it is the same drift in a quieter font. `is_free` says exactly what the
one surviving distinction is, the RLS free-enrolment policy reads it directly,
and `scripts/check-seed.mjs` fails if the seed ever omits it — the column
defaults to `false`, so a dropped column would silently make the intro track
paid and nothing would complain.

**What the money still remembers:** `payments.amount_mnt` records what was
charged, and `payments.course_id` stays nullable with its branch in
`settle_payment()` so a payment taken for one course before this still says what
it bought.

**Would change it:** a real demand to sell one track alone — a corporate order
for just "Fullstack", say. That is a price column plus a new entry in this file,
not a quiet re-read of `is_free`. (This used to name #013; a forward reference
to a number nobody owns goes stale the moment anything else is decided first,
which is exactly what happened.)

**Since written, `is_free` is false on every course.** Танилцуулга was the free
intro; the school decided the bundle is the only way in, so nothing opens
without a payment. That is a change of _setting_, not of model — which is the
boolean earning its keep, because the alternative design would have needed a
migration to say the same thing.

It also showed where the model leaks. Access is one flag, but the _claim_ about
access was in three places: `courses.is_free`, `lessons.is_preview` — a second
door that opens one lesson to somebody not even signed in — and the course's
own `description_mn`, which went on saying «Энэ сургалт үнэгүй» under a card
that had already started printing «Багцад багтсан». Postgres cannot notice
prose disagreeing with a boolean, and neither can TypeScript. If free courses
ever come back, all three move together.

---

## 013 — The phone app is deleted, not paused

**Chose:** `apps/mobile` is removed from the repository, along with everything
that existed to serve it: the Expo workspace, the `EXPO_PUBLIC_*` build
contract, pnpm's hoisting rules for React Native, `packages/core/src/theme.ts`
and its drift test, the redirect allowlist entries, and §9 of CLAUDE.md.
TsStark Academy is a website.

**Gave up:** a built and working Expo app — catalogue, player, quiz, progress,
account — and the option to resume it without redoing that work.

**Why:** an app that ships is a second product. Every lesson-shaped change owes
it a screen, every string owes it a render, and every release owes it a store
review; `pnpm test` could never see any of that, so the cost arrives as drift
rather than as a failure. A second front end is worth that when it does
something the web cannot — and this one could not: paid courses were bought on
the website anyway (the old #009), so the app's whole job was reading lessons
that a browser already reads.

**Why deleted rather than left in place:** an unbuilt app in the tree is worse
than no app. It keeps `pnpm install` resolving React Native, keeps three
`EXPO_PUBLIC_*` names in the build's environment contract where a missing
variable is invisible by design, and keeps a page of instructions telling the
next person that a feature is only half-finished until the phone has it. Code
that nobody runs is code nobody notices going wrong.

**What stayed, and why it is not a leftover:**

_The iOS/Android course._ The school teaches building mobile apps and sells
that track in the bundle. Deleting a product because we stopped shipping one is
a different decision entirely, and it is not this one.

_`packages/core`._ It was built as the seam between two clients and is still
where a decision that is not a screen belongs. The constraint it carries — no
`apps/*`, no `window`, no `next/*` — survives its original reason: it is what
lets the plain-Node test runner check this code at all.

**Would change it:** a reason a browser cannot serve — offline lessons on a bad
connection, push notifications somebody actually reads. Then it comes back as
its own slice and its own entry here, not by restoring a deleted directory.

---

## 014 — Lesson video sits in Cloudflare R2, in a public bucket

**Chose:** the films live in an R2 bucket, `lessons.video_url` holds the
absolute URL, and `scripts/upload-video.mjs` is the only thing in the repository
that holds an R2 credential. The bucket is **public**: the URL, once known, is
fetchable by anyone.

**Gave up:** paying per gigabyte watched, which is what almost every
alternative charges for — and, with it, adaptive bitrate. R2 serves the one file
it was given, so the encode has to be right for the worst connection a student
has rather than negotiated per viewer.

**Why R2:** egress is free. That is the only number that matters here, because
it is the only one that grows with the thing the school wants to grow. The
curriculum is a few gigabytes stored — cents a month, inside the free 10GB for a
long while — and a hundred students watching all of it moves tens of gigabytes
that would be billed anywhere else. Cloudflare Stream would give us the
adaptive ladder and signed playback, and charges per minute delivered; that is
the right trade for a video business and the wrong one for a school whose videos
are screen recordings.

**Why the website needs no R2 configuration at all:** because the column holds a
whole URL and the player is a plain `<video src>`. So no R2 name appears in
`turbo.json`'s build `env`, in Vercel, or in a browser bundle — and a name that
is not in the build contract cannot be the _missing_ variable that breaks a
deploy invisibly (§2). The cost is that moving to a different host means
rewriting every `video_url`; a base-URL variable would fix that and would put
media hosting back into the build's environment, which is the more expensive of
the two problems.

**Why public, which is the part worth arguing about:** §5.1's rule is that a
lesson you have not paid for is not _readable_, and that rule is kept —
`lesson_outline`, the view a stranger reads, does not project `video_url`, and
the `lessons` policy hands the row out only for a preview lesson or to somebody
with access. So you must have paid to **learn** the URL. What a public bucket
gives up is the step after that: a student who shares the link has shared the
film, and we cannot take it back.

Signed URLs would close that, and here is the bill — an R2 credential in the web
app's environment and therefore in `turbo.json`, a route to mint a token per
play, a TTL short enough to matter that has to survive somebody pausing a
lesson for an hour, and `LessonVideo` growing a refresh path. That is real
machinery against a leak we have no evidence of, for a course sold once at
199,000₮ rather than by the seat.

**Would change it:** evidence of sharing at a scale that costs money — a
referrer log full of origins that are not ours. Signing is a contained change
when it comes: one route, one prop, no schema.

**What r2.dev is not:** Cloudflare rate-limits the managed `*.r2.dev` origin and
puts no cache in front of it, so it is for checking a lesson on a laptop.
Production serves from a custom domain through Cloudflare —
`R2_PUBLIC_BASE` — and that is also what makes the CDN, and therefore the
free egress, actually fast in Mongolia. SETUP.md §11 has it.
