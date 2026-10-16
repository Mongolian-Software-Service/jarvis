-- ─────────────────────────────────────────────────────────────────────────────
-- VIP or Бэлэг: a grant says why it was given.
--
-- «Эрх олголт» opened the whole school for somebody and recorded only that the
-- team did it (`source = 'grant'`). The team gives it for two different reasons
-- — a VIP (a partner, a guest, somebody the school wants inside) and a gift (a
-- prize, a present) — and the dashboard is asked to show the two apart from
-- the students who bought it. So the reason is a column, chosen at the button.
--
-- A column on `enrollments`, not new values of `enrollment_source`:
--
--   * "is this a grant" stays one test — `source = 'grant'` — in every place
--     that already asks it: `is_chat_member()`, `revoke_all_courses()`, the
--     console's lists. Splitting the enum would have rewritten all of them, and
--     Postgres cannot drop the old value from an enum afterwards.
--   * The kind only means something on a grant, and the database says so: the
--     check below makes it required on a grant and absent on anything else.
--
-- A grant can become a purchase — `settle_payment()` upserts `source =
-- 'purchase'` over it, because a purchase is the stronger claim (§6.7). That
-- statement knows nothing about kinds, and the check would refuse it; so a
-- BEFORE trigger clears the kind whenever a row stops being a grant. The money
-- path is not edited and cannot be broken by this file.
--
-- The grants that already exist were given before anybody chose; they become
-- `gift`. Granting again with the other kind switches a person over — the
-- function re-kinds every grant row they hold, never a purchase.
--
-- And `source` loses its default of 'grant'. A grant now has to say why, so a
-- default that made one silently is a default that can only fail the check;
-- every writer in the app already names its source.
--
-- Re-runnable, like the others: the type and the constraint are checked
-- before they are created, the trigger and the old function are dropped.
-- ─────────────────────────────────────────────────────────────────────────────

begin;

do $$
begin
  if not exists (
    select 1 from pg_type
     where typname = 'grant_kind' and typnamespace = 'public'::regnamespace
  ) then
    create type public.grant_kind as enum ('vip', 'gift');
  end if;
end
$$;

alter table public.enrollments add column if not exists grant_kind public.grant_kind;

/* A row that is not a grant carries no kind, whatever the statement said. */
create or replace function public.enrollments_grant_kind()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.source <> 'grant' then
    new.grant_kind := null;
  end if;
  return new;
end;
$$;

-- Nothing calls it but its trigger, which needs no EXECUTE grant to fire.
revoke all on function public.enrollments_grant_kind() from public, anon, authenticated;

drop trigger if exists enrollments_grant_kind on public.enrollments;
create trigger enrollments_grant_kind before insert or update on public.enrollments
  for each row execute function public.enrollments_grant_kind();

update public.enrollments
   set grant_kind = 'gift'
 where source = 'grant' and grant_kind is null;

alter table public.enrollments alter column source drop default;

alter table public.enrollments drop constraint if exists enrollments_grant_kind_check;
alter table public.enrollments add constraint enrollments_grant_kind_check
  check ((source = 'grant') = (grant_kind is not null));

/*
 * The whole school, with the reason. Same gate as before — `is_admin()` inside,
 * so the console is not the security — and the kind is required: there is no
 * default, because a default is a choice nobody made.
 *
 * Two statements. The insert opens what they do not hold yet and counts it —
 * the return value still means "newly opened". The update then gives **every**
 * grant row they hold the chosen kind, drafts and per-course grants included,
 * so a switch is a whole switch and the console never reads a stale kind. A
 * course they bought is not a grant and is not touched.
 */
drop function if exists public.grant_all_courses(uuid);

create or replace function public.grant_all_courses(p_user uuid, p_kind public.grant_kind)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  granted integer;
begin
  if not public.is_admin() then
    raise exception 'Зөвхөн админ эрх олгоно' using errcode = '42501';
  end if;
  if p_kind is null then
    raise exception 'grant_kind is required' using errcode = '22004';
  end if;

  insert into public.enrollments (user_id, course_id, source, grant_kind)
  select p_user, c.id, 'grant', p_kind
    from public.courses c
   where c.is_published
  on conflict (user_id, course_id) do nothing;

  get diagnostics granted = row_count;

  update public.enrollments
     set grant_kind = p_kind
   where user_id = p_user
     and source = 'grant'
     and grant_kind is distinct from p_kind;

  return granted;
end;
$$;

-- Two revokes: PUBLIC is the create-time default, anon is Supabase's own grant.
revoke all on function public.grant_all_courses(uuid, public.grant_kind) from public;
revoke all on function public.grant_all_courses(uuid, public.grant_kind) from anon;
grant execute on function public.grant_all_courses(uuid, public.grant_kind) to authenticated;

-- Asserted, not assumed (20261004000200 has why).
do $$
begin
  if has_function_privilege('anon', 'public.grant_all_courses(uuid, public.grant_kind)', 'execute') then
    raise exception 'grant_all_courses is callable by anon';
  end if;
  -- The console calls it as the signed-in admin; without this it is locked out.
  if not has_function_privilege('authenticated', 'public.grant_all_courses(uuid, public.grant_kind)', 'execute') then
    raise exception 'grant_all_courses is not callable by authenticated';
  end if;
  if has_function_privilege('authenticated', 'public.enrollments_grant_kind()', 'execute')
     or has_function_privilege('anon', 'public.enrollments_grant_kind()', 'execute') then
    raise exception 'enrollments_grant_kind is callable by a client role';
  end if;
  if exists (
    select 1 from pg_proc
     where proname = 'grant_all_courses' and pronamespace = 'public'::regnamespace
       and pg_get_function_identity_arguments(oid) = 'p_user uuid'
  ) then
    raise exception 'the kindless grant_all_courses(uuid) is still there';
  end if;
end
$$;

commit;
