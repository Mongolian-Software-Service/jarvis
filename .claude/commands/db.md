---
description: Schema change — migration, policies, types
---

Use the `db-migration` skill. Then, for the change I am about to describe:

1. Write the migration in `supabase/migrations/` (never edit a pushed one).
2. RLS and policies in the same file.
3. Tell me what an **anonymous** client can now read that it could not before.
4. `pnpm db:types` and confirm the app still typechecks.
