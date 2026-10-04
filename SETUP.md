# Setting TsStark Academy up

Eleven steps, about half an hour. Steps 1–2 get the site running with no data;
3–7 give it a real database; 8–10 put it on the internet; 11 is where the films
go, and it can wait until there is one.

---

## 1. Install

```bash
pnpm install
```

Node 20.9+ is required (Next 16's floor). `pnpm -v` should say 11.x.

## 2. Run it

```bash
cp .env.example apps/web/.env.local
pnpm dev
```

`http://localhost:3001` → redirects to `/mn`. Without Supabase credentials the
pages render with nothing in them, which is the point of this step: the site,
the fonts and both languages are all working before the database exists.

---

## 3. Create the Supabase project

[supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
Region: pick the one closest to Mongolia (Singapore is usually the best of a bad
set). Save the database password somewhere real — it is shown once.

## 4. Fill in `apps/web/.env.local`

**Project Settings → API**:

| Dashboard                 | Variable                               |
| ------------------------- | -------------------------------------- |
| Project URL               | `NEXT_PUBLIC_SUPABASE_URL`             |
| Publishable / anon key    | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| Secret / service_role key | `SUPABASE_SECRET_KEY`                  |

The publishable key is meant to be in the browser — RLS is what protects the
data. **The secret key bypasses RLS entirely**: it belongs in `.env.local` and in
Vercel's environment, never in a file that ships, never in a commit.

## 5. Push the schema

### The short way — one command

Two things need a person at a keyboard: creating the project (step 3, the form
sets a database password) and creating the Google OAuth client (step 7, Google's
console). **Everything else is configuration, and there is a script for it.**

1. [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)
   → **Generate new token**.
2. Put it, and the project ref from your project's URL, in a `.env` at the repo
   root — gitignored, and the only file that holds either:

   ```
   SUPABASE_ACCESS_TOKEN=sbp_...
   SUPABASE_PROJECT_REF=abcdefghijklmnop
   APP_URL=https://www.tsstark-academy.com  # optional, for the redirect allowlist
   GOOGLE_CLIENT_ID=...                     # optional, from step 7
   GOOGLE_CLIENT_SECRET=...
   ```

3. ```bash
   pnpm supabase:setup
   ```

It applies the three migrations, runs the seed, sets the site URL and the
redirect allowlist, enables Google when both Google values are present, and
prints the two public values for `.env.local`. It is idempotent — run it again
after any change.

The rest of this step is the same work done by hand, if you would rather see it.

### By hand

```bash
pnpm dlx supabase login
pnpm dlx supabase link --project-ref <your-project-ref>   # the ref is in the project URL
pnpm db:push
```

That applies the three migrations in `supabase/migrations/`: the tables, the
functions and triggers, then RLS and every policy.

Check it took: **Table Editor** should list eight tables, and each should show
_RLS enabled_.

## 6. Seed the courses

**SQL Editor** → New query → paste all of `supabase/seed.sql` → Run.

Four published courses, one draft, twelve modules, thirty-seven lessons and
eleven quiz questions. The seed upserts by id, so running it twice is safe.

The site now has content: `http://localhost:3001/mn/courses`.

## 7. Make yourself an admin

Sign up on the site first — `/mn/sign-up` — so the account and its profile row
exist. Then, in the SQL Editor:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

Sign out and in again, and `/mn/admin` opens.

> Why by hand: the role is deliberately not something an account can give
> itself. `handle_new_user()` ignores anything the sign-up form sent about
> roles, and column-level UPDATE on `profiles.role` is revoked from ordinary
> users — `set_user_role()` (which asks `is_admin()`) is the only other door,
> and the first admin has nobody to open it for them.

### Email confirmation

By default Supabase emails a confirmation link before an account can sign in.
**Authentication → Providers → Email** → turn _Confirm email_ off while
developing, or read the link in **Authentication → Logs**.

For production, set **Authentication → URL Configuration → Site URL** to your
real domain and add `https://www.tsstark-academy.com/**` to the redirect
allowlist, or every confirmation link will point at localhost.

### Google sign-in

The button is already built, on the web and in the app. It needs two things
switched on, and neither of them lives in this repository.

**In Google Cloud Console** — [console.cloud.google.com](https://console.cloud.google.com):

1. Create a project (or pick one), then **APIs & Services → OAuth consent
   screen** — the current console has renamed this **Google Auth Platform →
   Branding**. External.

   **The app name is `TsStark Academy`, and it is not a formality.** It is the
   line a student reads at the moment they decide whether to hand over their
   Google account: the chooser says _"to continue to <app name>"_. Left unset,
   Google falls back to the OAuth client's own host — so the school introduces
   itself as `<your-project-ref>.supabase.co`, which is a string nobody
   recognises and every phishing warning has taught them to distrust. Fill in
   the support email and the developer email as well; the form will not save
   without both.

   That screen names the domain the sign-in **returns to**. Through Supabase's
   redirect that is `<ref>.supabase.co`; with the direct flow (CLAUDE.md §6.6)
   it returns to `/auth/google` on our own domain, and the chooser says
   «to continue to tsstark-academy.com» — no paid custom domain needed. The app
   name still matters wherever Google prints it, so get it right.

   While it is in _Testing_ only the addresses you list under _Test users_ can
   sign in — publish it when you are ready for real students.

2. **Credentials → Create credentials → OAuth client ID → Web application.**
3. Under **Authorised redirect URIs** add all three:

   ```
   https://www.tsstark-academy.com/auth/google      the direct flow, production
   http://localhost:3001/auth/google                the direct flow, locally
   https://<your-project-ref>.supabase.co/auth/v1/callback   the fallback
   ```

   The first two are ours: Google returns there, and the app hands Supabase
   the ID token. The third is Supabase's, for wherever the direct flow is off
   (no keys set, or a Vercel preview). The exact path matters — `/auth/google`
   with no trailing slash and no locale.

4. Copy the **Client ID** and **Client secret** — the secret starts `GOCSPX-`,
   and the console shows it only when it is created. They go in two places:
   Supabase (step 5), and the app's own environment as `GOOGLE_CLIENT_ID` /
   `GOOGLE_CLIENT_SECRET` (`apps/web/.env.local`, and Vercel). **Not** from
   Supabase's API afterwards: it hands back a hash of the secret, not the
   secret, and Google refuses the hash as `invalid_client`.

**In Supabase** — **Authentication → Sign In / Providers → Google**:

5. Enable it, paste the client ID and secret, save.
6. **Authentication → URL Configuration → Redirect URLs** — add all of these:

   ```
   http://localhost:3000/**                 the web, locally
   http://localhost:3001/**                 the web, locally — the dev port
   https://www.tsstark-academy.com/**       the web, in production
   ```

   A redirect that is not on this list is **not** refused with an error — it is
   silently replaced by the site URL, so the failure looks like the site being
   broken rather than the list being short.

   **The `/**` matters.** These used to read `…/auth/confirm`, with no wildcard,
   and that is an _exact_ URL. Sign-in never asks for it: it asks for
   `/auth/confirm?locale=mn`, so nothing matched and every redirect fell back to
   the site URL. In production the site URL is the production site, so the
   fallback landed correctly and the list looked fine. On a laptop it did not —
   signing in at `localhost:3001` threw the reader onto the live domain.

   Two more entries lived here — `tsstark://**` and `exp://**` — for an Expo app
   that no longer exists. If any remain in the dashboard they are harmless, but
   they point at nothing: **remove them**, or the next person reads the list as
   a promise that an app is coming.

That is all. `/auth/confirm` already exchanges the code for a session — the same
route the email links use — and `handle_new_user()` fills the new profile's name
and picture from Google's claims. **The role is not read from them**, ever:
every account arrives as a student (step 7 is how the first one stops being one).

One button does both jobs. An address Google knows and Supabase does not becomes
an account on the first tap; after that the same button signs in. There is no
separate "sign up with Google".

---

## 8. Payments

Payments are live only. There is no mock mode (decision #015): a laptop
without the keys refuses a purchase with a sentence and writes nothing.

Done on 2026-10-04 — this is what to redo if the keys are ever rotated:

1. **Vercel → Production**, as Secret-type variables. Paste each value from the
   clipboard so it never passes through a chat or a file:

   ```bash
   [ -n "$(pbpaste)" ] && pbpaste | tr -d '[:space:]' | pnpm dlx vercel env add BONUM_APP_SECRET production
   ```

   — and the same for `BONUM_TERMINAL_ID` and `BONUM_MERCHANT_CHECKSUM_KEY`.
   `BONUM_API_BASE_URL=https://apis.bonum.mn` and
   `BONUM_CALLBACK_URL=https://www.tsstark-academy.com/api/webhooks/bonum` are
   not secret. An interactive `vercel env add` with nothing pasted saves an
   **empty** value and says only `Value is empty` — the guarded pipe is why.
   To change one: `vercel env rm NAME production -y`, then add it again.

2. **Redeploy** — a variable reaches only builds made after it was set.
3. **Bonum merchant panel** (merchant.bonum.mn) → Мерчант → **Web Hook** → URL:
   the same callback URL. Configuration → App Secret should name the same
   terminal as `BONUM_TERMINAL_ID`.
4. Check: `curl -X POST -d '{}' https://www.tsstark-academy.com/api/webhooks/bonum`
   answers **400 Invalid checksum** (a 500 means the checksum key is missing).
   Then buy once with a real card. See `.claude/skills/payments`.

## 9. Deploy to Vercel

```bash
pnpm dlx vercel link
```

In the Vercel project settings:

- **Root directory**: `apps/web`
- **Build command**: `cd ../.. && pnpm build --filter @jarvis/web`
- **Install command**: `pnpm install`
- **Environment variables**: every name in CLAUDE.md §2's environment block.
  The `BONUM_*` five go in as in §8 above.

> Every variable must **also** appear in `turbo.json`'s build `env` array.
> Turborepo runs builds in strict env mode: a name missing from that list is not
> passed to the build however carefully it was set in the dashboard.

Set `NEXT_PUBLIC_APP_URL` to `https://www.tsstark-academy.com`. The apex redirects there,
so the `www.` form is the canonical one and the only one worth building links
from. It is what the confirmation links,
the sitemap, the OG tags and the payment callback are built from.

## 10. After the first deploy

- Supabase **Authentication → URL Configuration** → Site URL = your domain.
- Run the seed against production, or write the real courses in `/mn/admin`.
- Make the production account an admin with the same SQL as step 7.
- Replace the example values in `CONTACT` (`packages/core/src/constants.ts`)
  with the real inbox, phone and social accounts. They are what `/mn/contact`
  shows; a channel left empty is not rendered at all.
- Walk the ship checklist in CLAUDE.md §7, with numbers.

---

## 11. The lesson videos

They live in **Cloudflare R2**, because egress is free and egress is the only
bill that grows with the school (decision #014). `lessons.video_url` holds a
whole URL and the player is a plain `<video src>`, so **the website itself needs
no R2 configuration** — nothing here goes into `turbo.json` or Vercel. Only the
upload script reads these.

### Once, in the Cloudflare dashboard

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **R2** → the overview
   page shows your **Account ID**. (R2 asks for a card even while you stay
   inside the free 10GB.)
2. **R2 → Manage API tokens → Create API token.** Permission **Admin Read &
   Write**. Copy the token — it is shown once.

   **Admin**, not the narrower _Object Read & Write_, and the difference is not
   cosmetic: Object can put a file and nothing else. Creating the bucket and
   switching on public access are both bucket _configuration_, which only Admin
   may change. The narrow token is still the better one if you would rather do
   those two things by hand — make the bucket in the dashboard, turn public
   access on, put the address in `R2_PUBLIC_BASE`, and the upload script will
   say it could not check the bucket and carry on regardless.

3. Add both to the `.env` at the repo root, beside the Supabase pair:

   ```
   CLOUDFLARE_ACCOUNT_ID=...
   CLOUDFLARE_API_TOKEN=...
   R2_BUCKET=tsstark-videos        # optional, this is the default
   R2_PUBLIC_BASE=https://video.tsstark-academy.com   # see below
   ```

The bucket is created on the first upload, so there is nothing to click for it.

### `R2_PUBLIC_BASE`, and why it is not optional for real students

Without it the script switches on the bucket's managed `*.r2.dev` address and
uses that. **That is a development address.** Cloudflare rate-limits it and puts
no cache in front of it, so a class watching one lesson at the same time is
precisely the traffic it is not for.

For production, connect a custom domain — the domain has to be on Cloudflare:

**R2 → your bucket → Settings → Public access → Custom domains → Connect
domain** → `video.tsstark-academy.com`. Cloudflare writes the DNS record itself.
Then put `https://video.tsstark-academy.com` in `R2_PUBLIC_BASE`. Now the CDN is
in front of the bucket, which is what makes free egress fast from Mongolia as
well as free.

> A URL already written into a lesson does not move when this changes. Re-run
> the upload for that lesson, or update the column.

### Uploading one

```bash
pnpm video:upload ~/Movies/ehlehiin-umnu.mp4 ehlehiin-umnu
```

The second argument is the lesson's own slug. Given one, the script uploads the
file to `lessons/<slug>.mp4`, writes the URL into `supabase/seed.sql` **and**
updates that one live row with a single `update` — not a re-run of the seed,
which on a project students are reading would rewrite every lesson from a file
that may be ahead of them. Pass `--seed-only` to skip the live half. Leave the
slug off to upload a poster frame or a subtitle file and just be told its URL.

`pnpm test` names every lesson still pointing at the MDN sample clip, so a
forgotten film is reported on every run rather than discovered by a student.

### Encode it for a phone on mobile data

A lesson is a screen recording: mostly still frames, which compress to almost
nothing if asked properly. Free egress does not make a student's data plan free,
and there is no adaptive bitrate here — one file is served to everybody, so that
file has to suit the worst connection in the class.

```bash
ffmpeg -i raw.mov -vf scale=-2:720 -c:v libx264 -crf 26 -preset slow \
  -profile:v high -pix_fmt yuv420p -movflags +faststart \
  -c:a aac -b:a 96k ehlehiin-umnu.mp4
```

`+faststart` is the one that is not taste: it moves the index to the front of
the file, which is what lets playback begin before the whole thing has landed.
Without it a ten-minute lesson looks broken for its first several seconds.

Ten minutes should come out in the tens of megabytes. The script warns past
100MB, and refuses nothing — the warning is about the student, not the bucket.

---

## Working locally against a local database

If you have Docker and would rather not touch the hosted project:

```bash
pnpm dlx supabase start     # first run downloads several GB of images
pnpm db:reset               # migrations + seed, from scratch
```

`supabase start` prints a local URL and keys — put those in `.env.local`
instead. `pnpm db:reset` destroys and rebuilds that local database; it does
**not** touch the hosted one.
