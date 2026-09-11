-- ─────────────────────────────────────────────────────────────────────────────
-- Jarvis — row level security.
--
-- The rule this file exists to enforce: **a lesson you have not paid for is not
-- readable, by any client, through any query.** Hiding a locked lesson in the
-- interface is decoration; PostgREST will hand out anything the policies allow,
-- and the publishable key is in every browser bundle.
--
-- RLS is enabled and every table has a policy. We deliberately do NOT `force`
-- it: `force` constrains only the table *owner*, which no application path uses
-- — anon, authenticated and service_role are unaffected — while it does break
-- seeding and the SQL editor. Enabled + explicit policies + revoked grants is
-- the protection.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.profiles        enable row level security;
alter table public.courses         enable row level security;
alter table public.modules         enable row level security;
alter table public.lessons         enable row level security;
alter table public.quiz_questions  enable row level security;
alter table public.enrollments     enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.payments        enable row level security;

-- ── Grants ───────────────────────────────────────────────────────────────────
--
-- Belt as well as braces. A policy mistake and a grant mistake have to happen
-- together before an anonymous visitor can write anything.
revoke insert, update, delete on all tables in schema public from anon;

-- Nobody edits their own role. The grant is what stops it — a policy saying
-- "you may update your own profile" cannot tell one column from another.
-- `set_user_role()` (000200) is the only way in, and it asks who is calling.
revoke update on public.profiles from authenticated;
grant update (email, full_name, avatar_url, locale) on public.profiles to authenticated;

-- The two views. `lesson_outline` is the public syllabus; `course_progress`
-- reads as the caller and so returns only their own rows.
grant select on public.lesson_outline  to anon, authenticated;
grant select on public.course_progress to authenticated;

-- Settling an invoice creates an enrollment. Only the webhook — which is the
-- only thing holding the service key — may do that.
revoke all on function public.settle_payment(text, public.payment_status, jsonb, text) from public;
grant execute on function public.settle_payment(text, public.payment_status, jsonb, text) to service_role;

-- ── profiles ─────────────────────────────────────────────────────────────────
create policy profiles_read on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- No insert policy on purpose: `handle_new_user()` writes the row as the
-- definer, and nothing else has any business creating a profile.

-- ── courses ──────────────────────────────────────────────────────────────────
create policy courses_read on public.courses
  for select to anon, authenticated
  using (is_published or public.is_admin());

create policy courses_admin on public.courses
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ── modules ──────────────────────────────────────────────────────────────────
-- The shape of a syllabus is public: somebody deciding whether to enrol has to
-- see what the course covers.
create policy modules_read on public.modules
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.courses c
       where c.id = modules.course_id and (c.is_published or public.is_admin())
    )
  );

create policy modules_admin on public.modules
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ── lessons ──────────────────────────────────────────────────────────────────
--
-- The row carries the body, the video and the solution, so the row itself is
-- what has to be withheld. Titles and running order still reach everyone —
-- through `lesson_outline` (000200), which projects away everything paid for.
create policy lessons_read on public.lessons
  for select to anon, authenticated
  using (
    public.is_admin()
    or (
      exists (select 1 from public.courses c where c.id = lessons.course_id and c.is_published)
      and (lessons.is_preview or public.has_course_access(lessons.course_id))
    )
  );

create policy lessons_admin on public.lessons
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ── quiz_questions ───────────────────────────────────────────────────────────
--
-- Gated exactly like the lesson they belong to. `correct_index` travels to the
-- client, which is deliberate: the quiz marks itself the moment an answer is
-- tapped, offline and on the phone, and a teaching quiz is not an exam. If one
-- ever needs to be, the answer moves behind a `check_answer()` RPC and this
-- comment is how you will know that was a decision and not an oversight.
create policy quiz_read on public.quiz_questions
  for select to anon, authenticated
  using (
    public.is_admin()
    or exists (
      select 1
        from public.lessons l
        join public.courses c on c.id = l.course_id
       where l.id = quiz_questions.lesson_id
         and c.is_published
         and (l.is_preview or public.has_course_access(l.course_id))
    )
  );

create policy quiz_admin on public.quiz_questions
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ── enrollments ──────────────────────────────────────────────────────────────
create policy enrollments_read_own on public.enrollments
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- A free course enrols itself. Every clause here is doing work: you may only
-- enrol *yourself*, only in a course that is *published* and costs *nothing*,
-- and the row must say so. A paid course cannot be opened this way whatever the
-- client sends.
create policy enrollments_self_free on public.enrollments
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and source = 'free'
    and expires_at is null
    and exists (
      select 1 from public.courses c
       where c.id = course_id and c.is_published and c.price_mnt = 0
    )
  );

create policy enrollments_admin on public.enrollments
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ── lesson_progress ──────────────────────────────────────────────────────────
--
-- Yours to read, write and delete — and only for a course you hold, so a
-- crafted request cannot seed progress through a course nobody paid for.
create policy progress_own on public.lesson_progress
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and public.has_course_access(course_id));

create policy progress_admin_read on public.lesson_progress
  for select to authenticated
  using (public.is_admin());

-- ── payments ─────────────────────────────────────────────────────────────────
create policy payments_read_own on public.payments
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- Checkout writes the pending row as the buyer. It cannot be born `paid`:
-- that transition belongs to `settle_payment()` and to the callback alone.
create policy payments_insert_own on public.payments
  for insert to authenticated
  with check (user_id = auth.uid() and status = 'pending' and paid_at is null);

create policy payments_admin on public.payments
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ── Storage ──────────────────────────────────────────────────────────────────
--
-- One public bucket for course covers and lesson attachments. Public read
-- because `next/image` fetches them without a session; writes are the team's.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy media_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'media');

create policy media_admin_write on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());

create policy media_admin_update on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

create policy media_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());
