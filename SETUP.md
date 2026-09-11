# Setting Jarvis up

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

`http://localhost:3000` → redirects to `/mn`. Without Supabase credentials the
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

The site now has content: `http://localhost:3000/mn/courses`.

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
