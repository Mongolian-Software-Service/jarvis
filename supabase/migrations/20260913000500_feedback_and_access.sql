-- ─────────────────────────────────────────────────────────────────────────────
-- Санал хүсэлт, ба эрх олголт.
--
-- Two things the console was missing: a way for a student to say something and
-- be heard, and a way to open the whole school for somebody without taking
-- their money — a scholarship, a partner, a person whose payment failed at
-- eleven at night.
-- ─────────────────────────────────────────────────────────────────────────────

/*
 * What a student sent, and nothing they did not.
 *
 * The row carries the author and the words. It does **not** carry their name,
 * phone or address: those live on `profiles`, the console reads them through
 * the join, and a student who fixes their phone number next week fixes it
 * everywhere rather than on every message they have ever sent. Copying them in
 * here would be three columns that quietly go stale.
 */
create table if not exists public.feedback (
  id         uuid primary key default gen_random_uuid(),
  -- profiles, never auth.users: PostgREST cannot see a relationship to a schema
  -- it does not expose, and this row is only interesting joined to its author.
  user_id    uuid not null references public.profiles (id) on delete cascade,
  body       text not null check (length(btrim(body)) between 4 and 4000),
  created_at timestamptz not null default now()
);

-- The console lists newest first and nothing else; one index covers it.
create index if not exists feedback_created_at_idx on public.feedback (created_at desc);
-- The policy below filters on this, and so does "what have I already sent".
create index if not exists feedback_user_id_idx on public.feedback (user_id);

alter table public.feedback enable row level security;

/*
 * A student writes their own and reads their own back. They cannot edit or
 * delete one: a message that can be rewritten after it is read is not a record
 * of anything, and the console is a queue rather than a conversation.
 */
create policy feedback_insert_own on public.feedback
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy feedback_read_own on public.feedback
  for select to authenticated
  using (user_id = (select auth.uid()));

/* The team reads every message and may clear one out. */
create policy feedback_admin on public.feedback
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

revoke all on public.feedback from anon, authenticated;
grant select, insert on public.feedback to authenticated;

/*
 * Take back what was given — and only what was given.
 *
 * The mirror of `grant_all_courses`, and the reason it is a function rather
 * than a delete in the action: `enrollments.source` tells apart a course
 * somebody **bought** (`purchase`), one they took because it is free (`free`)
 * and one the team handed them (`grant`). Only the last is ours to withdraw.
 * A plain `delete where user_id = …` would quietly repossess a paid course,
 * and the student would find out by opening a lesson.
 */
create or replace function public.revoke_all_courses(p_user uuid)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  removed integer;
begin
  if not public.is_admin() then
    raise exception 'Зөвхөн админ эрх хаана' using errcode = '42501';
  end if;

  delete from public.enrollments
   where user_id = p_user
     and source = 'grant';

  get diagnostics removed = row_count;
  return removed;
end;
$$;

revoke all on function public.revoke_all_courses(uuid) from anon, authenticated;
grant execute on function public.revoke_all_courses(uuid) to authenticated;

/*
 * Finding a student by the address they registered with.
 *
 * «Эрх олголт» looks an account up by email, and nothing indexed that column —
 * every grant was a sequential scan of the whole school. **Unique**, not just
 * an index, because it is already true: `auth.users` enforces one account per
 * address and the trigger copies it across one-to-one. Saying so here is what
 * lets the lookup use `.maybeSingle()` honestly — without it, two rows claiming
 * one address would surface as a runtime error on the console's search box
 * rather than as the impossible state it is.
 *
 * Nulls are exempt in Postgres, so a profile whose address has not been copied
 * yet is unaffected.
 */
create unique index if not exists profiles_email_key on public.profiles (email);
