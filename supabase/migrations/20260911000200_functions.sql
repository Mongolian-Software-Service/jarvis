-- ─────────────────────────────────────────────────────────────────────────────
-- Jarvis — functions, triggers and the two views the app reads through.
--
-- Everything here runs before the policies in 000300, because the policies call
-- `is_admin()` and `has_course_access()` by name.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── updated_at ───────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at        before update on public.profiles        for each row execute function public.set_updated_at();
create trigger courses_updated_at         before update on public.courses         for each row execute function public.set_updated_at();
create trigger modules_updated_at         before update on public.modules         for each row execute function public.set_updated_at();
create trigger lessons_updated_at         before update on public.lessons         for each row execute function public.set_updated_at();
create trigger lesson_progress_updated_at before update on public.lesson_progress for each row execute function public.set_updated_at();

-- ── A profile for every account ──────────────────────────────────────────────
--
-- Supabase Auth owns sign-up; this is what gives the rest of the product
-- somebody to join against. Runs as the definer because `auth.users` fires it
-- and the new account has no session yet.
--
-- **The role is not read from user metadata, and never will be.** A signed-in
-- user can write their own `raw_user_meta_data` through the client SDK, so a
-- role taken from there is a role anybody can award themselves. Every account
-- starts as a student; `set_user_role()` below is the only way out of that.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    nullif(trim(coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      ''
    )), ''),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep the email in step when somebody changes it in Supabase Auth.
create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = new.email where id = new.id;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row execute function public.handle_user_email_change();

-- ── Authorisation ────────────────────────────────────────────────────────────
--
-- `security definer` is load-bearing, not decoration: the policy on `profiles`
-- calls this, and a function that read `profiles` as the caller would re-enter
-- that policy and recurse until Postgres gave up.
--
-- The JWT claim is checked first because it costs nothing — no round trip, no
-- table read — and `app_metadata` is the half of the token a user cannot write.
-- The table is the fallback, so promoting somebody takes effect on their next
-- request rather than on their next sign-in.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
      or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$$;

-- Does the caller hold this course?
--
-- Access is an enrollment that has not expired. Admins hold everything, which
-- is what lets one person check a paid lesson renders before announcing it.
create or replace function public.has_course_access(course uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.is_admin()
      or exists (
        select 1 from public.enrollments e
        where e.course_id = course
          and e.user_id = auth.uid()
          and (e.expires_at is null or e.expires_at > now())
      );
$$;

-- The one way an account's role changes.
--
-- Column-level UPDATE on `profiles.role` is revoked from `authenticated` in
-- 000300, so this is not a convenience wrapper — it is the only door, and it
-- checks who is knocking.
create or replace function public.set_user_role(p_user uuid, p_role public.user_role)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_admin() then
    raise exception 'Зөвхөн админ эрх өөрчилнө' using errcode = '42501';
  end if;
  update public.profiles set role = p_role where id = p_user;
end;
$$;

-- ── A lesson belongs to its module's course ──────────────────────────────────
--
-- `lessons.course_id` is denormalised, and a denormalised column that nothing
-- maintains is a column that will be wrong by the second time a lesson is moved
-- between modules. This makes it impossible to write the wrong value rather
-- than merely impolite.
create or replace function public.sync_lesson_course()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  select m.course_id into new.course_id from public.modules m where m.id = new.module_id;
  if new.course_id is null then
    raise exception 'Модуль олдсонгүй: %', new.module_id using errcode = '23503';
  end if;
  return new;
end;
$$;

create trigger lessons_sync_course
  before insert or update of module_id on public.lessons
  for each row execute function public.sync_lesson_course();

-- Progress rows carry the same denormalised course, for the same reason.
create or replace function public.sync_progress_course()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  select l.course_id into new.course_id from public.lessons l where l.id = new.lesson_id;
  if new.course_id is null then
    raise exception 'Хичээл олдсонгүй: %', new.lesson_id using errcode = '23503';
  end if;
  return new;
end;
$$;

create trigger progress_sync_course
  before insert or update of lesson_id on public.lesson_progress
  for each row execute function public.sync_progress_course();

-- ── Settling a payment ───────────────────────────────────────────────────────
--
-- The gateway callback's whole job, in one transaction: mark the invoice paid
-- and open the course. Two statements from the route handler instead would
-- leave a window where money is taken and nothing was unlocked — and that
-- window is exactly where a serverless function gets killed.
--
-- Idempotent on purpose. Gateways retry, and a second delivery of the same
-- callback must not mint a second enrollment or move `paid_at`.
--
-- EXECUTE is revoked from anon and authenticated in 000300: only the service
-- key — which is to say, only the webhook route — may call it.
create or replace function public.settle_payment(
  p_invoice_id text,
  p_status     public.payment_status,
  p_raw        jsonb default null,
  p_provider   text default 'bonum'
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  row public.payments;
begin
  select * into row
    from public.payments
   where provider = p_provider and invoice_id = p_invoice_id
   for update;

  if not found then
    raise exception 'Нэхэмжлэх олдсонгүй: %', p_invoice_id using errcode = 'P0002';
  end if;

  -- Already settled. Say which row it was and change nothing.
  if row.status = 'paid' then
    return row.id;
  end if;

  update public.payments
     set status  = p_status,
         paid_at = case when p_status = 'paid' then now() else paid_at end,
         raw     = coalesce(p_raw, raw)
   where id = row.id;

  if p_status = 'paid' then
    insert into public.enrollments (user_id, course_id, source)
    values (row.user_id, row.course_id, 'purchase')
    on conflict (user_id, course_id)
      -- Somebody who was granted access and then bought it anyway: the
      -- purchase is the stronger claim, and it clears any expiry the grant had.
      do update set source = 'purchase', expires_at = null;
  end if;

  return row.id;
end;
$$;

-- ── The public syllabus ──────────────────────────────────────────────────────
--
-- A course page has to list every lesson — titles, order, length — to somebody
-- who has not paid, while the bodies, the videos and the solutions stay behind
-- the policy in 000300. RLS is row-level, so the two cannot be separated on one
-- table by a policy alone.
--
-- This view is the projection: the columns anybody may see, for published
-- courses only. It runs as its owner (`security_invoker` left off), which is
-- what lets it read past the `lessons` policy — and is why the `is_published`
-- filter inside it is load-bearing, not cosmetic.
create view public.lesson_outline as
  select l.id,
         l.course_id,
         l.module_id,
         l.slug,
         l.title_mn,
         l.title_en,
         l.kind,
         l.duration_minutes,
         l.is_preview,
         l.rank
    from public.lessons l
    join public.courses c on c.id = l.course_id
   where c.is_published;

comment on view public.lesson_outline is
  'Lesson metadata for published courses, readable by anyone. Deliberately owner-
   invoked so it can see past the lessons policy; it exposes no body, video,
   solution or quiz answer. Add a column here only after asking whether a
   stranger may read it.';

-- ── A student's own progress, per course ─────────────────────────────────────
--
-- `security_invoker` is on, so this reads `lesson_progress` as the caller and
-- the policy there already limits the rows to their own. One round trip for the
-- learner dashboard instead of one per enrolled course.
create view public.course_progress with (security_invoker = true) as
  select p.user_id,
         p.course_id,
         count(*) filter (where p.completed_at is not null)::int as completed_lessons,
         max(p.updated_at) as last_activity
    from public.lesson_progress p
   group by p.user_id, p.course_id;
