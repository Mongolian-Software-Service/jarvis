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

## 009 — The phone: no NativeWind, no in-app purchase, keychain sessions

**Chose:** `apps/mobile` styles with `StyleSheet` over the shared palette;
paid courses are bought on the website, not in the app; the Supabase session is
chunked into `expo-secure-store`.

**Gave up:** Tailwind's vocabulary on the phone, a purchase flow that never
leaves the app, and the simplicity of AsyncStorage.

**Why, one at a time:**

*No NativeWind* — it would mean a second styling dialect kept in step with the
web's by hand, plus a babel and metro configuration to maintain across Expo
upgrades. The palette and type scale already had to exist as data for React
Native; `StyleSheet` over them is the whole of what NativeWind would have
bought, without the dependency. This is the same reasoning as #004.

*No in-app purchase* — Apple's guideline 3.1.1 requires IAP for digital content
sold inside an iOS app, at Apple's commission, and Bonum is not IAP. Shipping a
Bonum checkout inside the app would fail review. Sending the buyer to the
website is what every course app does, and the enrolment is waiting for them
when they come back because it is the same database.

*Keychain, chunked* — `expo-secure-store` refuses values over ~2KB and a
Supabase session is comfortably past that, which is why the common advice is
AsyncStorage. AsyncStorage is a plain file: a stolen unlocked phone is somebody
else's paid courses. Chunking is thirty lines.

**Would change it:** if the school ever sells through the App Store at scale,
IAP plus a server-side receipt check becomes its own slice — and the enrolment
it writes is the same row Bonum writes today.

---

## 010 — One theme, and it is dark

**Chose:** the dark palette is the only palette. No `data-theme` attribute, no
`light:` variant, no toggle in the header, no theme row in the phone's
settings, no theme cookie — and one `theme-color`.

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
attribute somebody adds mid-feature. `packages/core/test/theme.test.ts` fails if
one appears without that decision.
