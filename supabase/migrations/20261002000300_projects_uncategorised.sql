-- ─────────────────────────────────────────────────────────────────────────────
-- A project is a student's, not a course's.
--
-- 000100 filed every project under a course, one per course, and the form
-- opened with a course picker. In use it was a question nobody could answer
-- well — a student's site is rarely the output of exactly one track, and
-- «Танилцуулга хичээл» sat first in the list for a course that builds nothing.
-- So the category goes: a project belongs to the person who made it.
--
-- Three things leaned on `course_id` and are rebuilt here: the uniqueness that
-- bounded how many projects one student could post, the course check in the
-- write policies (which goes, rather than being replaced), and the showcase
-- view that printed the course title.
-- ─────────────────────────────────────────────────────────────────────────────

-- One transaction: if any statement fails, the table keeps its course column,
-- its policies and its view exactly as 000200 left them.
begin;

-- Everything that depends on the column comes off before it does. Dropping the
-- column then takes `unique (user_id, course_id)` and `projects_course_id_idx`
-- with it — no `cascade`, so anything else that depends on it stops this here.
drop view if exists public.project_showcase;
drop policy if exists projects_insert_own on public.projects;
drop policy if exists projects_update_own on public.projects;

alter table public.projects drop column if exists course_id;

-- The unique index used to serve "my projects" and the policies; this does now.
create index if not exists projects_user_id_idx on public.projects (user_id);

/*
 * Who may post: anybody signed in, as themselves.
 *
 * The per-course check could not survive the column, and nothing replaces it
 * on purpose. A student who has not bought the bundle yet may still have built
 * something worth showing, and the showcase is where they would want to show
 * it. What bounds a single account is the ten-project cap below; what removes a
 * bad link is `projects_admin_delete` (000200).
 */
create policy projects_insert_own on public.projects
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy projects_update_own on public.projects
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

/*
 * Saving is no longer an upsert on (student, course): a new project is an
 * insert and an edit is an update by `id`. So nothing has to write `user_id`
 * on update any more, and the grant stops offering it. What is left is the
 * three things a student types.
 */
revoke update (user_id) on public.projects from authenticated;

/*
 * At most ten projects a student.
 *
 * The unique constraint used to bound this at one per course; without it the
 * only limit would be patience, and every row lands in every classmate's feed.
 * Ten is a portfolio, not a spam run. `PROJECT_LIMIT` in packages/core is the
 * same number, so the dashboard hides the form at ten rather than letting the
 * student find this by pressing Save.
 *
 * A trigger rather than a policy because it counts the table it guards, and a
 * definer so it counts every row of that student rather than the rows their
 * own policy happens to show. Two saves in the same instant could both pass;
 * an eleventh project is not worth a lock.
 *
 * It counts only for a row filed under the caller. A BEFORE trigger runs
 * ahead of the policy's `with check`, so a forged `user_id` would otherwise
 * get "limit reached" back for a stranger with ten projects — a way of asking
 * how many somebody else has. Such a row is the policy's to refuse, so it is
 * passed straight through to it.
 */
create or replace function public.projects_enforce_limit()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.user_id is distinct from (select auth.uid()) then
    return new;
  end if;
  if (select count(*) from public.projects where user_id = new.user_id) >= 10 then
    raise exception 'project_limit' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

-- Nothing calls this but the trigger, which needs no EXECUTE grant to fire.
revoke all on function public.projects_enforce_limit() from public, anon, authenticated;

drop trigger if exists projects_limit on public.projects;
create trigger projects_limit before insert on public.projects
  for each row execute function public.projects_enforce_limit();

/*
 * The showcase, without the course.
 *
 * Same projection as 000200 and the same reasons for it: owner-invoked so it
 * can read a first name past the `profiles` policy, and it gives out nothing
 * else about the person. The `is_published` filter went with the course join —
 * there is no course left to be unpublished.
 */
create view public.project_showcase as
  select p.id,
         p.url,
         p.title,
         p.description,
         nullif(btrim(pr.first_name), '')           as author_first_name,
         left(nullif(btrim(pr.last_name), ''), 1)   as author_initial,
         (p.user_id = (select auth.uid()))          as is_mine,
         p.created_at
    from public.projects p
    join public.profiles pr on pr.id = p.user_id;

comment on view public.project_showcase is
  'Every student''s project, for signed-in students. Deliberately owner-invoked so
   it can see past the projects and profiles policies; it exposes no email, phone
   or user id. Add a column here only after asking whether every student may
   read it.';

revoke all on public.project_showcase from public, anon, authenticated;
grant select on public.project_showcase to authenticated;

commit;
