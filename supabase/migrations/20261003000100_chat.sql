-- ─────────────────────────────────────────────────────────────────────────────
-- «Мэдэхгүй зүйлээ асуу» — one room, everybody in it, live.
--
-- A student who is stuck at eleven at night should not have to wait for the
-- feedback queue to be read in the morning. The room is the whole school: any
-- signed-in person can ask, anybody can answer, and the team is marked so an
-- answer from them reads as one. Messages arrive in every open browser through
-- Supabase Realtime, the moment they are written.
-- ─────────────────────────────────────────────────────────────────────────────

begin;

/*
 * Two tables, because a Realtime event delivers the whole row.
 *
 * Every browser in the room receives every message as it is written, and
 * whatever the row carries goes with it. So `chat_messages` holds only what the
 * whole room may read — the words, the author's printed name and whether they
 * are on the team — and **who wrote it** lives in `chat_authors`, which each
 * person can read only for themselves.
 *
 * Column-level grants on one table were the first design, and were refused for
 * the reason that matters most in a live room: whether Realtime honours column
 * privileges is a detail of its internals, and if it does not, the failure is
 * silent — the socket connects and no message ever arrives. A table with
 * nothing to hide needs no such detail to be true.
 *
 * The name is copied in at the moment of sending rather than joined at read
 * time: an arriving row has to be complete, and `profiles` is each person's own.
 * A name changed later stays as it was on old messages — in a conversation,
 * that is who said it, at the time.
 */
create table if not exists public.chat_messages (
  id                uuid primary key default gen_random_uuid(),
  -- `btrim` on the four whitespace characters, and at least one that is not,
  -- so "\n" on its own is not a message that looks empty in the room.
  body              text not null check (
                      body ~ '\S'
                      and body = btrim(body, E' \t\r\n')
                      and length(body) <= 2000
                    ),
  author_first_name text,
  author_initial    text,
  is_team           boolean not null default false,
  created_at        timestamptz not null default now()
);

create index if not exists chat_messages_created_at_idx on public.chat_messages (created_at desc);

create table if not exists public.chat_authors (
  message_id uuid primary key references public.chat_messages (id) on delete cascade,
  -- profiles, never auth.users (§5).
  user_id    uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- The rate limit counts one author's last minute; the policies look up by user.
create index if not exists chat_authors_user_recent_idx on public.chat_authors (user_id, created_at desc);

/*
 * Before the row: refuse a flood, and write in who is speaking.
 *
 * The author is `auth.uid()` — never a value the client sent; there is no
 * `user_id` on the message to send. The name and the team flag come from
 * `profiles` and overwrite anything the insert carried, so nobody can post as
 * «Баг» or under somebody else's name (the column grant below does not let a
 * client name those columns anyway).
 *
 * Ten messages a minute a person. A conversation never comes near it; a script
 * pasting into a room every student has open does. Two sends in the same
 * instant can both pass — an eleventh message is not worth a lock.
 */
create or replace function public.chat_messages_prepare()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  me uuid := auth.uid();
  author record;
begin
  -- Nobody signed in: the insert policy refuses the row, on its own terms.
  if me is null then
    return new;
  end if;

  if (
    select count(*) from public.chat_authors
     where user_id = me and created_at > now() - interval '1 minute'
  ) >= 10 then
    raise exception 'chat_rate_limit' using errcode = 'P0001';
  end if;

  select nullif(btrim(first_name), '')         as first_name,
         left(nullif(btrim(last_name), ''), 1) as initial,
         role = 'admin'                        as team
    into author
    from public.profiles where id = me;

  new.author_first_name := author.first_name;
  new.author_initial    := author.initial;
  new.is_team           := coalesce(author.team, false);
  new.created_at        := now();
  return new;
end;
$$;

/* After the row exists: record whose it is, where only they can read it. */
create or replace function public.chat_messages_attribute()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is not null then
    insert into public.chat_authors (message_id, user_id) values (new.id, auth.uid());
  end if;
  return null;
end;
$$;

-- Nothing calls these but their triggers, which need no EXECUTE grant to fire.
revoke all on function public.chat_messages_prepare() from public, anon, authenticated;
revoke all on function public.chat_messages_attribute() from public, anon, authenticated;

drop trigger if exists chat_messages_prepare on public.chat_messages;
create trigger chat_messages_prepare before insert on public.chat_messages
  for each row execute function public.chat_messages_prepare();

drop trigger if exists chat_messages_attribute on public.chat_messages;
create trigger chat_messages_attribute after insert on public.chat_messages
  for each row execute function public.chat_messages_attribute();

alter table public.chat_messages enable row level security;
alter table public.chat_authors enable row level security;

/*
 * The room: everybody signed in reads it and may speak in it; you may take
 * back your own words, and the team may take down anybody's.
 */
create policy chat_read on public.chat_messages
  for select to authenticated
  using (true);

create policy chat_insert on public.chat_messages
  for insert to authenticated
  with check ((select auth.uid()) is not null);

create policy chat_delete on public.chat_messages
  for delete to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.chat_authors a
       where a.message_id = chat_messages.id and a.user_id = (select auth.uid())
    )
  );

/* Authorship: yours to read, nobody else's. Written only by the trigger. */
create policy chat_authors_read_own on public.chat_authors
  for select to authenticated
  using (user_id = (select auth.uid()));

/*
 * Insert names `body` and nothing else; the trigger writes the rest. There is
 * no update: a message is not edited after the room has read it. Revoked first
 * because Supabase grants every new relation in `public` to both roles.
 */
revoke all on public.chat_messages from anon, authenticated;
grant select, delete on public.chat_messages to authenticated;
grant insert (body) on public.chat_messages to authenticated;

revoke all on public.chat_authors from anon, authenticated;
grant select on public.chat_authors to authenticated;

-- Live: every insert and delete goes out to the browsers subscribed to it.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
     where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'chat_messages'
  ) then
    alter publication supabase_realtime add table public.chat_messages;
  end if;
end $$;

commit;
