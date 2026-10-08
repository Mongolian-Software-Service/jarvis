-- ─────────────────────────────────────────────────────────────────────────────
-- Blocking somebody from «Мэдэхгүй зүйлээ асуу».
--
-- Deleting a message takes one message down; somebody who keeps writing them
-- needs to be stopped, not followed around. A block is a row here, and it
-- stops the person from *writing* — they can still read the room, and they
-- see a sentence saying they cannot post instead of the composer. Taking the
-- room away entirely would show them `ChatLocked`, whose sentence is "pay to
-- join": a wrong thing to say to somebody who paid.
--
-- Three pieces:
--
--   1. `chat_blocks` — who, by whom, since when. The team writes it; a student
--      reads only their own row, which is how the room knows to show them the
--      notice. Nobody else learns who is blocked. The team inserts `user_id`
--      and nothing else (a column grant, like `insert (body)` on the messages),
--      so who blocked and when are always the database's own record. An admin
--      cannot block themselves: a console that locks out the person using it
--      is a support call with nobody to take it.
--   2. A BEFORE INSERT trigger on `chat_messages` that refuses a blocked author
--      with `chat_blocked` (P0001, like `chat_rate_limit`), which the send
--      action turns into a sentence. It is the gate, not the interface: a
--      client that skips the page and inserts through PostgREST meets the same
--      trigger. Same-timing triggers fire in name order, so it runs before
--      `chat_messages_prepare` — which only decides that a blocked person at
--      the rate limit is told they are blocked, not that they are flooding.
--      (A refused insert rolls back and never counted against the limit.)
--   3. The team may read `chat_authors`. Until now only the author could, so
--      the console knew *what* was said and not by which account — and a
--      block has to name an account. Students still read only their own rows,
--      and the reason the table exists (a Realtime event must not tell the
--      room who wrote what) is untouched: neither table is published, and the
--      assertion at the end refuses to apply if either is.
--
-- Re-runnable: every policy is dropped before it is created, so a missing
-- `applied_migrations` row cannot wedge `supabase-setup.mjs` on this file.
-- ─────────────────────────────────────────────────────────────────────────────

begin;

create table if not exists public.chat_blocks (
  -- profiles, never auth.users (§5). One row a person: blocked or not.
  user_id    uuid primary key references public.profiles (id) on delete cascade,
  -- Who pressed it. Kept if that admin's account goes, as an empty name.
  blocked_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

alter table public.chat_blocks enable row level security;

drop policy if exists chat_blocks_read on public.chat_blocks;
create policy chat_blocks_read on public.chat_blocks
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists chat_blocks_insert on public.chat_blocks;
create policy chat_blocks_insert on public.chat_blocks
  for insert to authenticated
  with check ((select public.is_admin()) and user_id <> (select auth.uid()));

drop policy if exists chat_blocks_delete on public.chat_blocks;
create policy chat_blocks_delete on public.chat_blocks
  for delete to authenticated
  using ((select public.is_admin()));

-- Supabase grants every new relation in `public` to both client roles by name;
-- take that back and give exactly what the policies above can use.
revoke all on public.chat_blocks from anon, authenticated;
grant select, delete on public.chat_blocks to authenticated;
grant insert (user_id) on public.chat_blocks to authenticated;

/* The gate. Security definer so it reads the list whatever the policies say. */
create or replace function public.chat_messages_block()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if exists (select 1 from public.chat_blocks where user_id = auth.uid()) then
    raise exception 'chat_blocked' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

-- Nothing calls it but its trigger, which needs no EXECUTE grant to fire.
revoke all on function public.chat_messages_block() from public, anon, authenticated;

drop trigger if exists chat_messages_block on public.chat_messages;
create trigger chat_messages_block before insert on public.chat_messages
  for each row execute function public.chat_messages_block();

/* The team reads authorship; everybody else still reads only their own. */
drop policy if exists chat_authors_admin_read on public.chat_authors;
create policy chat_authors_admin_read on public.chat_authors
  for select to authenticated
  using ((select public.is_admin()));

-- Asserted, not assumed (20261004000200 has why).
do $$
begin
  if not (select relrowsecurity from pg_class where oid = 'public.chat_blocks'::regclass) then
    raise exception 'chat_blocks has row level security off';
  end if;
  if has_table_privilege('anon', 'public.chat_blocks', 'select, insert, update, delete, truncate')
     or has_table_privilege('authenticated', 'public.chat_blocks', 'update, truncate') then
    raise exception 'chat_blocks grants more than its policies can use';
  end if;
  if has_function_privilege('authenticated', 'public.chat_messages_block()', 'execute')
     or has_function_privilege('anon', 'public.chat_messages_block()', 'execute') then
    raise exception 'chat_messages_block is callable by a client role';
  end if;
  -- chat_blocks is keyed by the person: a Realtime DELETE event carries the key
  -- and is not filtered by RLS, so publishing it would announce every unblock.
  if exists (
    select 1 from pg_publication_tables
     where pubname = 'supabase_realtime' and schemaname = 'public'
       and tablename in ('chat_blocks', 'chat_authors')
  ) then
    raise exception 'chat_blocks / chat_authors must not be in supabase_realtime';
  end if;
end
$$;

commit;
