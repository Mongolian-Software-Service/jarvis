-- ─────────────────────────────────────────────────────────────────────────────
-- «Мэдэхгүй зүйлээ асуу» is for the school's students, not for everybody with
-- an account.
--
-- 000100 opened the room to anybody signed in. Signing up costs nothing, so
-- that was a room anybody on the internet could walk into, read every student's
-- question and post in — and a teacher's time answering there is part of what
-- the bundle buys. So the room now belongs to those who paid, and to the people
-- who answer them.
--
-- The gate is here rather than in the page. The page hides the room from a
-- visitor who has not paid, but the publishable key is in every bundle and
-- `chat_messages` is a table PostgREST hands out by policy; hiding it in the
-- interface alone would be decoration (§5.1). Realtime checks the same select
-- policy before it delivers an insert, so a socket opened by hand hears no
-- message. A delete is the exception: the row is gone, there is nothing left to
-- test the policy against, and every socket is told its id — a random uuid,
-- and only that while the table keeps its default replica identity. Never set
-- `replica identity full` here.
-- ─────────────────────────────────────────────────────────────────────────────

begin;

/*
 * Who may be in the room.
 *
 * - the team (`is_admin()`), who moderate it;
 * - a teacher (`teacher_emails`, 000200), who answers — whether or not they
 *   ever bought anything;
 * - a student holding a live enrolment that was **paid for**: `purchase` from
 *   the gateway, or `grant` — the console's «they paid offline»
 *   (`grant_all_courses()`, 20260913000100). `free` is left out on purpose: no course is free today, and if
 *   one is again, taking it is not the same as having paid (§1).
 *
 * Definer, because `teacher_emails` is readable by the team alone and this
 * question has to be answerable by the person asking it. It reads only the
 * caller's own rows, and answers with a boolean.
 */
create or replace function public.is_chat_member()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.is_admin()
      or exists (
        select 1 from public.profiles p
          join public.teacher_emails t on t.email = lower(p.email)
         where p.id = auth.uid()
      )
      or exists (
        select 1 from public.enrollments e
         where e.user_id = auth.uid()
           and e.source in ('purchase', 'grant')
           and (e.expires_at is null or e.expires_at > now())
      );
$$;

-- Two revokes: PUBLIC is the create-time default, anon is Supabase's own grant.
-- Authenticated needs it — the policies below run as the reader, and the page
-- asks it directly to decide between the room and the locked panel.
revoke all on function public.is_chat_member() from public;
revoke all on function public.is_chat_member() from anon;
grant execute on function public.is_chat_member() to authenticated;

/*
 * The room's own two policies, narrowed. Wrapped in a sub-select so Postgres
 * asks once per statement rather than once per message.
 *
 * `chat_delete` is unchanged and needs no second clause: the action deletes
 * with a filter and a `returning`, both of which make Postgres apply the select
 * policy as well — so somebody outside the room cannot reach a row to delete.
 */
drop policy if exists chat_read on public.chat_messages;
create policy chat_read on public.chat_messages
  for select to authenticated
  using ((select public.is_chat_member()));

drop policy if exists chat_insert on public.chat_messages;
create policy chat_insert on public.chat_messages
  for insert to authenticated
  with check ((select public.is_chat_member()));

commit;
