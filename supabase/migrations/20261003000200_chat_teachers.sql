-- ─────────────────────────────────────────────────────────────────────────────
-- «Багш» in the room — the teacher's answers stand out from the students'.
--
-- The room marks the team already (`is_team`, from `profiles.role`). A teacher
-- is a different thing from an admin: the person whose answer a student should
-- trust first, who need not be able to run the console at all. So it is its
-- own list rather than a role — the same shape as `admin_emails` (000300), and
-- for the same reason: who may speak with a teacher's mark is decided in a
-- migration or the SQL editor, never by a request.
-- ─────────────────────────────────────────────────────────────────────────────

begin;

create table if not exists public.teacher_emails (
  -- Stored folded, so a capital letter in a sign-up form cannot miss a match.
  email      text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);

alter table public.teacher_emails enable row level security;

drop policy if exists teacher_emails_read on public.teacher_emails;
create policy teacher_emails_read on public.teacher_emails
  for select to authenticated
  using (public.is_admin());

revoke all on public.teacher_emails from anon, authenticated;
grant select on public.teacher_emails to authenticated;

insert into public.teacher_emails (email) values ('mulen.enn@gmail.com')
on conflict (email) do nothing;

/*
 * Copied onto the message like the name is, so a Realtime row arrives knowing
 * it is a teacher's. Not in the insert grant (000100 grants `body` alone), so
 * no client can set it; the trigger below is the only writer.
 */
alter table public.chat_messages
  add column if not exists is_teacher boolean not null default false;

/* 000100's trigger, with one more question asked of the author. */
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

  select nullif(btrim(p.first_name), '')         as first_name,
         left(nullif(btrim(p.last_name), ''), 1) as initial,
         p.role = 'admin'                        as team,
         exists (
           select 1 from public.teacher_emails t where t.email = lower(p.email)
         )                                       as teacher
    into author
    from public.profiles p where p.id = me;

  new.author_first_name := author.first_name;
  new.author_initial    := author.initial;
  new.is_team           := coalesce(author.team, false);
  new.is_teacher        := coalesce(author.teacher, false);
  new.created_at        := now();
  return new;
end;
$$;

revoke all on function public.chat_messages_prepare() from public, anon, authenticated;

-- What a teacher already said before the mark existed carries it too.
update public.chat_messages m
   set is_teacher = true
  from public.chat_authors a
  join public.profiles p on p.id = a.user_id
 where a.message_id = m.id
   and lower(p.email) in (select email from public.teacher_emails);

commit;
