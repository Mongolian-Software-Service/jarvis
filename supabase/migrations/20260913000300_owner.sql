-- ─────────────────────────────────────────────────────────────────────────────
-- Who runs the school.
--
-- The role still lives on `profiles.role` and is still only writable through
-- `set_user_role()` (§5) — this table grants nothing by itself. It is the list
-- `handle_new_user()` consults when an account first appears, so the owner does
-- not have to be promoted by hand on every fresh database, and so a re-seed
-- cannot quietly leave the school with no admin.
--
-- **The address is not proof of identity.** This project has Supabase's
-- auto-confirm on, which means a sign-up is treated as verified without anybody
-- reading the mail. So being on this list is only as strong as being first to
-- register that address. It is right for a one-owner school whose owner
-- registers on day one; it would be wrong for a list that grows.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.admin_emails (
  -- Stored folded, so a capital letter in a sign-up form cannot miss a match.
  email      text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);

alter table public.admin_emails enable row level security;

-- Readable by the team, writable through no API at all: changing who owns the
-- school is a migration or a session in the SQL editor, never a request.
drop policy if exists admin_emails_read on public.admin_emails;
create policy admin_emails_read on public.admin_emails
  for select to authenticated
  using (public.is_admin());

revoke all on public.admin_emails from anon, authenticated;
grant select on public.admin_emails to authenticated;

insert into public.admin_emails (email) values ('tsstark1@icloud.com')
on conflict (email) do nothing;

/*
 * The profile trigger, now with one extra question.
 *
 * Everything else is unchanged, including the rule that matters most: the role
 * is **never** read from `raw_user_meta_data`. A signed-in user can write their
 * own metadata, so a role taken from there is a role anybody can award
 * themselves. It comes from this table or it comes from `set_user_role()`.
 */
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    nullif(trim(coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      ''
    )), ''),
    new.raw_user_meta_data ->> 'avatar_url',
    case
      when exists (select 1 from public.admin_emails a where a.email = lower(new.email))
        then 'admin'::public.user_role
      else 'student'::public.user_role
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- An account that already existed when the list was written.
update public.profiles p
   set role = 'admin'
 where lower(p.email) in (select email from public.admin_emails)
   and p.role <> 'admin';
