-- ─────────────────────────────────────────────────────────────────────────────
-- There is one price, and it is the bundle.
--
-- `courses.price_mnt` was an amount somebody could be charged for a single
-- course. The school does not sell a course on its own any more: one payment
-- opens every published course, for good, and the number is
-- `BUNDLE_PRICE_MNT` in packages/core. A money column that nothing charges is
-- a column the next reader will believe — and the admin console would keep
-- asking for a price nobody pays — so it goes.
--
-- The one thing it still had to say is whether a course is free to anyone who
-- signs in, or sits inside the bundle. That was always a boolean wearing a
-- price, and it becomes one here.
--
-- What was charged is not lost: `payments.amount_mnt` records it, which is
-- where a historical price belongs. If a single course is ever sold again, a
-- price column comes back with a decision in docs/decisions/, not as a quiet
-- re-read of this one.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.courses
  add column if not exists is_free boolean not null default false;

-- Carry the meaning across before the column it came from is gone.
update public.courses set is_free = (price_mnt = 0);

/*
 * The free-enrolment policy is the only place the database itself reads the
 * price, and it has to be rewritten *before* the drop — a policy that depends
 * on a column makes `drop column` fail, and `cascade` would take the policy
 * with it and leave the table open on that path.
 */
drop policy if exists enrollments_self_free on public.enrollments;

create policy enrollments_self_free on public.enrollments
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and source = 'free'
    and expires_at is null
    and exists (
      select 1 from public.courses c
       where c.id = course_id and c.is_published and c.is_free
    )
  );

alter table public.courses drop column if exists price_mnt;
