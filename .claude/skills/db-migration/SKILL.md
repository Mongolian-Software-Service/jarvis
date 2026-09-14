---
name: db-migration
description: Change TsStark Academy's Supabase schema safely — new tables, columns, enums, indexes, and the RLS policies that must come with them. Use this ANY time work touches the database, even indirectly: adding a feature that stores something, "add a field for X", "students should be able to save Y", fixing a permission error, a 42501 / "new row violates row-level security policy", or regenerating types. Do not hand-write SQL against the database without reading this first.
---

# Changing the schema

## Rules

1. **Never edit a migration that has been pushed.** Write a new one.
2. Every new table gets `enable row level security` **and at least one policy in
   the same migration**. RLS on with no policy makes the table invisible to
   everyone, including the screen you just built — the most common bug here.
3. **Owner columns reference `public.profiles(id)`, never `auth.users(id)`.**
   `auth.users` is not in the exposed schema, so PostgREST cannot see a
   relationship to it and every "who did this" join fails at runtime with
   *"could not find the relation"*.
4. Money is `integer`, suffixed `_mnt`. Never `numeric`, never a float.
5. Timestamps are `timestamptz default now()`. Anything with `updated_at` gets
   the `set_updated_at` trigger.
6. Slugs use the `public.slug` domain, not bare `text`.
7. Any column used in a policy's `where` clause or a list query needs an index.
8. Enums: `create type … as enum`. Adding a value is `alter type … add value`,
   which **cannot run inside a transaction** — it needs its own migration.
9. **Locking a function down takes two revokes, not one.** A role reaches
   `execute` by two independent routes, and revoking one leaves the other:

   ```sql
   revoke all on function public.f(uuid) from public;  -- the create-time default
   revoke all on function public.f(uuid) from anon;    -- Supabase's named grant
   grant execute on function public.f(uuid) to authenticated;
   ```

   `revoke … from anon, authenticated` **alone does nothing**: PUBLIC is every
   role and is not covered by naming two of them. The tell is the error text —
   "permission denied for function" means the gate held; your function's own
   `raise` means the call got through it and only the `is_admin()` check inside
   stopped it.
10. **A table GRANT is the outer gate; RLS only filters within a command the
    role already holds.** So a policy written `for all` against a table granted
    only `select, insert` has update and delete branches that can never fire.
    Make the two agree — and prefer narrowing the policy to what the app
    actually does over widening the grant to match a promise nobody needs.

## The rule this schema exists to enforce

A lesson somebody has not paid for must not be readable **through any query**.
When you touch `lessons`, `quiz_questions` or `enrollments`, re-read §5.1 of
CLAUDE.md and ask: does this change let an anonymous request reach a paid
column? If you add a column to `public.lesson_outline`, you are publishing it.

## Steps

```bash
pnpm db:new <descriptive_name>   # supabase migration new
# write the SQL
supabase db reset                # local stack only — destroys local data
pnpm db:push                     # apply to the linked project
pnpm db:types                    # ALWAYS. regenerates packages/types/src/database.ts
```

`pnpm db:types` is not optional: the whole codebase reads its row shapes from
that file, so skipping it makes TypeScript lie in your favour.

## Policy templates

```sql
-- Public read of published rows, admin everything.
create policy x_read on public.x for select to anon, authenticated
  using (is_published or public.is_admin());

create policy x_admin on public.x for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Rows a student owns.
create policy x_own on public.x for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and public.has_course_access(course_id));
```

## Checks before you call it done

- [ ] RLS enabled, at least one policy, and an admin policy if the console edits it
- [ ] Tried the read as an anonymous client — does it return what you expect, and nothing else?
- [ ] `pnpm db:types` run, and the app typechecks against the new types
- [ ] Indexes for anything the policies filter on
