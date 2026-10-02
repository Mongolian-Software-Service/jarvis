-- ─────────────────────────────────────────────────────────────────────────────
-- Миний төслүүд — what a student built, and where it lives.
--
-- Every track ends in something real: a landing page on a domain, an app that
-- signs people in, a game somebody can open. The school had nowhere to put the
-- address of it. This is that place — one link per course, kept by the student
-- on their own dashboard and read by the team in the console.
-- ─────────────────────────────────────────────────────────────────────────────

/*
 * One row per (student, course), not a free-form list.
 *
 * A course has one outcome, and tying the link to it is what makes the row
 * mean something to the team: «Landing page» next to a URL says what to look
 * for when they open it. Saving again for the same course replaces the link —
 * a student who moves from `*.vercel.app` to their own domain has one project,
 * not two.
 *
 * `url` is checked here as well as in the schema because it is rendered as an
 * `href`, on the student's screen and on the team's. A `javascript:` link that
 * reached the column through a hand-made request would run in an admin's
 * session the moment they clicked it — so the database refuses anything that
 * is not http or https, whoever sent it.
 */
create table if not exists public.projects (
  id         uuid primary key default gen_random_uuid(),
  -- profiles, never auth.users (§5): the console reads this joined to its author.
  user_id    uuid not null references public.profiles (id) on delete cascade,
  course_id  uuid not null references public.courses (id) on delete cascade,
  -- A host before the first slash: `https:///` and `https://` alone are refused.
  url        text not null
             check (length(url) <= 500 and url ~* '^https?://[^[:space:]/]+[^[:space:]]*$'),
  -- Optional: the course already says what it is. A name is for the student.
  -- Stored trimmed, so an empty box arrives as null rather than as "  ".
  title      text check (title is null or (title = btrim(title) and length(title) between 1 and 80)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, course_id)
);

-- `unique (user_id, course_id)` already indexes every "my projects" read and
-- the policies below. These two are for the console and for a course delete.
create index if not exists projects_course_id_idx on public.projects (course_id);
create index if not exists projects_updated_at_idx on public.projects (updated_at desc);

create trigger projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

alter table public.projects enable row level security;

/*
 * A student keeps their own — reads it, adds it, changes it, takes it down —
 * and only against a course they hold. The course check is on the write, like
 * `progress_own`: a crafted request should not be able to file a project under
 * a course nobody paid for, where the console would show it as if they had.
 */
create policy projects_read_own on public.projects
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy projects_insert_own on public.projects
  for insert to authenticated
  with check (user_id = (select auth.uid()) and public.has_course_access(course_id));

create policy projects_update_own on public.projects
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and public.has_course_access(course_id));

create policy projects_delete_own on public.projects
  for delete to authenticated
  using (user_id = (select auth.uid()));

/*
 * The team reads every project and edits none. A link is the student's to
 * change; the console is where it is looked at. (The same narrowing as
 * `feedback_admin_read`, 000600: a policy should not promise what nobody does.)
 */
create policy projects_admin_read on public.projects
  for select to authenticated
  using (public.is_admin());

/*
 * `update` names its columns, so `id` and `created_at` cannot be rewritten.
 *
 * It is four columns rather than `(url, title)` because saving goes through
 * PostgREST's upsert, whose `do update` sets every column in the payload —
 * including the two the conflict is on. The policy's `with check` is what
 * stops a row being moved to somebody else; `updated_at` is the trigger's, and
 * a trigger writing `new` needs no column grant.
 */
revoke all on public.projects from anon, authenticated;
grant select, insert, delete on public.projects to authenticated;
grant update (user_id, course_id, url, title) on public.projects to authenticated;
