-- ─────────────────────────────────────────────────────────────────────────────
-- Сурагчдын төслүүд — every student's project, for every other student to see.
--
-- 000100 kept a project between its author and the team. It is now the point
-- of the «Сайн уу» page: what other people in the school built, with their
-- name on it, so a student who has just finished a lesson can see where the
-- road goes. Three changes follow from that, and each is in this file.
-- ─────────────────────────────────────────────────────────────────────────────

/*
 * 1. A description — what it does, what it was made with.
 *
 * A link on its own says nothing to a classmate scrolling past it. Optional,
 * like the title: a student who only wants to keep the link for themselves
 * should not be made to write a paragraph first. Stored trimmed, for the same
 * reason the title is (000100).
 */
alter table public.projects
  add column if not exists description text
  check (description is null or (description = btrim(description) and length(description) between 1 and 500));

grant update (description) on public.projects to authenticated;

-- The feed reads newest first.
create index if not exists projects_created_at_idx on public.projects (created_at desc);

/*
 * 2. The showcase is a projection, not a policy.
 *
 * Another student's project has to come with their name, and the name lives on
 * `profiles` — whose policy, rightly, lets nobody read anybody else's row: the
 * same row carries the phone number and the email. A policy cannot give out
 * two columns of a row and withhold the rest, so this is `lesson_outline`'s
 * answer again (§5.1): an owner-invoked view that projects **away** everything
 * a classmate may not read.
 *
 * What it gives out, and nothing more: the link, its title and description,
 * the course, and the author as a first name plus the initial of their овог —
 * «Б.Тэмүүлэн», the way a Mongolian name is written short. No email, no phone,
 * no `user_id`: whether a row is the reader's own is answered here, as
 * `is_mine`, rather than by handing every reader everybody's id.
 *
 * `security_invoker` is left off on purpose — it is what lets the view read
 * past the `projects` and `profiles` policies — which makes the `is_published`
 * filter load-bearing, exactly as it is in `lesson_outline`. Before adding a
 * column here, ask whether every signed-in student may read it.
 */
create or replace view public.project_showcase as
  select p.id,
         c.title_mn                                 as course_title_mn,
         c.title_en                                 as course_title_en,
         p.url,
         p.title,
         p.description,
         nullif(btrim(pr.first_name), '')           as author_first_name,
         left(nullif(btrim(pr.last_name), ''), 1)   as author_initial,
         -- auth.uid() reads the request's JWT, not the role running the view,
         -- so it is the reader even though the view runs as its owner.
         (p.user_id = (select auth.uid()))          as is_mine,
         p.created_at
    from public.projects p
    join public.courses  c  on c.id  = p.course_id
    join public.profiles pr on pr.id = p.user_id
   where c.is_published;

comment on view public.project_showcase is
  'Every student''s project, for signed-in students. Deliberately owner-invoked so
   it can see past the projects and profiles policies; it exposes no email, phone
   or user id. Add a column here only after asking whether every student may
   read it.';

/*
 * Signed in only. A stranger has not joined the school and is not owed its
 * students' names; the public site sells the courses, not the people in them.
 * Revoked first because Supabase grants every new relation in `public` to
 * `anon` and `authenticated` by default.
 */
revoke all on public.project_showcase from public, anon, authenticated;
grant select on public.project_showcase to authenticated;

/*
 * 3. The team can take a link down.
 *
 * 000100 made the console read-only, and that was right while a link was seen
 * only by its author. It is now opened by every student in the school, so a
 * link that turns out to be a phishing page — or simply something that should
 * not be there — has to be removable by somebody other than the person who
 * posted it. Delete only: the team removes, it never rewrites a student's
 * words. `delete` is already granted (000100); this is the policy for it.
 */
drop policy if exists projects_admin_delete on public.projects;
create policy projects_admin_delete on public.projects
  for delete to authenticated
  using (public.is_admin());
