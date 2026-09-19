# Setting TsStark Academy up

Ten steps, about twenty minutes. Steps 1–2 get the site running with no data;
3–7 give it a real database; 8–10 put it on the internet.

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

| Dashboard | Variable |
| --- | --- |
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| Publishable / anon key | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| Secret / service_role key | `SUPABASE_SECRET_KEY` |

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
   APP_URL=https://yourdomain.mn          # optional, for the redirect allowlist
   GOOGLE_CLIENT_ID=...                   # optional, from step 7
   GOOGLE_CLIENT_SECRET=...
   ```

3. ```bash
   pnpm supabase:setup
   ```

It applies the three migrations, runs the seed, sets the site URL and the
redirect allowlist (including `tsstark://**` and `exp://**` for the phone),
enables Google when both Google values are present, and prints the two public
values for `.env.local`. It is idempotent — run it again after any change.

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
*RLS enabled*.

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
**Authentication → Providers → Email** → turn *Confirm email* off while
developing, or read the link in **Authentication → Logs**.

For production, set **Authentication → URL Configuration → Site URL** to your
real domain and add `https://yourdomain.mn/auth/confirm` to the redirect
allowlist, or every confirmation link will point at localhost.

### Google sign-in

The button is already built, on the web and in the app. It needs two things
switched on, and neither of them lives in this repository.

**In Google Cloud Console** — [console.cloud.google.com](https://console.cloud.google.com):

1. Create a project (or pick one), then **APIs & Services → OAuth consent
   screen**. External. Fill in the app name, your support email, and the
   developer email. While it is in *Testing* only the addresses you list under
   *Test users* can sign in — publish it when you are ready for real students.
2. **Credentials → Create credentials → OAuth client ID → Web application.**
3. Under **Authorised redirect URIs** add exactly one:

   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```

   That is Supabase's URL, not ours. Google talks to Supabase; Supabase talks to
   us. Putting `localhost:3001` here instead is the mistake that costs an hour.
4. Copy the **Client ID** and **Client secret**.

**In Supabase** — **Authentication → Sign In / Providers → Google**:

5. Enable it, paste the client ID and secret, save.
6. **Authentication → URL Configuration → Redirect URLs** — add all of these:

   ```
   http://localhost:3001/auth/confirm      the web, locally
   https://yourdomain.mn/auth/confirm      the web, in production
   tsstark://**                            the app, installed
   exp://**                                Expo Go on a simulator
   exp://*.exp.direct/**                   Expo Go on a real phone, --tunnel
   ```

   A redirect that is not on this list is **not** refused with an error — it is
   silently replaced by the site URL, so the failure looks like the site being
   broken rather than the list being short.

   **Supabase rejects any redirect whose host is an IP address**, and no
   allowlist entry changes that — an exact literal is refused too:

   | redirect | result |
   | --- | --- |
   | `exp://localhost:8081/--/auth/callback` | accepted |
   | `exp://ab.anonymous.8081.exp.direct/--/auth/callback` | accepted |
   | `exp://192.168.0.178:8081/--/auth/callback` | **refused** |

   That last one is exactly what Expo Go hands out on a **physical** device over
   the LAN — which is why Google sign-in works in the simulator and bounces to
   `localhost` on a real phone. There is no entry that fixes it. On hardware,
   either run `npx expo start --tunnel` (the host becomes `*.exp.direct`, a real
   name) or use a development build, where the scheme is `tsstark://`.

That is all. `/auth/confirm` already exchanges the code for a session — the same
route the email links use — and `handle_new_user()` fills the new profile's name
and picture from Google's claims. **The role is not read from them**, ever:
every account arrives as a student (step 7 is how the first one stops being one).

One button does both jobs. An address Google knows and Supabase does not becomes
an account on the first tap; after that the same button signs in. There is no
separate "sign up with Google".

---

## 8. Payments

Nothing to do yet. `BONUM_MOCK=1` is already in `.env.example`, so a purchase
settles locally and opens the course — the whole flow is walkable without a
merchant account.

When Bonum issues real credentials, fill in `BONUM_APP_SECRET`,
`BONUM_TERMINAL_ID` and `BONUM_MERCHANT_CHECKSUM_KEY`, set `BONUM_MOCK=0`, and
point `BONUM_CALLBACK_URL` at `https://yourdomain.mn/api/webhooks/bonum`. See
`.claude/skills/payments`.

## 9. Deploy to Vercel

```bash
pnpm dlx vercel link
```

In the Vercel project settings:

- **Root directory**: `apps/web`
- **Build command**: `cd ../.. && pnpm build --filter @jarvis/web`
- **Install command**: `pnpm install`
- **Environment variables**: every name from `.env.example` except the
  `BONUM_MOCK=1` line — set it to `0`, or leave it unset.

> Every variable must **also** appear in `turbo.json`'s build `env` array.
> Turborepo runs builds in strict env mode: a name missing from that list is not
> passed to the build however carefully it was set in the dashboard.

Set `NEXT_PUBLIC_APP_URL` to the real domain. It is what the confirmation links,
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

## Working locally against a local database

If you have Docker and would rather not touch the hosted project:

```bash
pnpm dlx supabase start     # first run downloads several GB of images
pnpm db:reset               # migrations + seed, from scratch
```

`supabase start` prints a local URL and keys — put those in `.env.local`
instead. `pnpm db:reset` destroys and rebuilds that local database; it does
**not** touch the hosted one.
