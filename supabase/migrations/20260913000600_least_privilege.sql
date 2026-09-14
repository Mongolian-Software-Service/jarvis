-- ─────────────────────────────────────────────────────────────────────────────
-- Least privilege, in the two places the last migration got it wrong.
--
-- Neither of these was a hole — both functions re-check `is_admin()` inside the
-- transaction, and that is what actually stops anybody. They are the outer
-- gate, and an outer gate that is open means the only thing between a stranger
-- and a grant is one `if` statement inside a function somebody may edit later.
-- ─────────────────────────────────────────────────────────────────────────────

/*
 * 1. `revoke … from anon, authenticated` does nothing to a function.
 *
 * A function is created with `execute` granted to **PUBLIC**, and PUBLIC is not
 * a role you can name in a revoke list — it is every role, including the two
 * that were named. So `revoke all on function … from anon, authenticated` left
 * `=X/postgres` in the ACL and `anon` could still call it: tested, and it came
 * back with the function's own «Зөвхөн админ эрх хаана» rather than
 * "permission denied for function", which is the tell.
 *
 * The correct order is revoke from PUBLIC first, then grant to the one role
 * that should have it. `grant_all_courses` has the same shape and was never
 * revoked at all, so it is fixed here too — a new migration rather than an edit
 * to the applied one (§3.1).
 */
revoke all on function public.grant_all_courses(uuid) from public;
revoke all on function public.revoke_all_courses(uuid) from public;

grant execute on function public.grant_all_courses(uuid) to authenticated;
grant execute on function public.revoke_all_courses(uuid) to authenticated;

/*
 * 2. A policy should not promise what the grants refuse.
 *
 * `feedback_admin` was written `for all` while the table grants `authenticated`
 * only `select, insert` — so its update and delete branches could never fire,
 * because a table GRANT is the outer gate and RLS only filters rows *within* a
 * command the role already holds. The two disagreed, and the disagreement read
 * as a capability the console had.
 *
 * It does not have it: the console lists messages and opens one. Nothing edits
 * or deletes a student's words, and a record that can be rewritten after it is
 * read is not a record. So the policy is narrowed to what is true rather than
 * the grants widened to match a promise nobody asked for. If clearing out spam
 * is ever wanted, it comes back as `grant delete` **plus** a policy — one
 * migration, deliberately.
 */
drop policy if exists feedback_admin on public.feedback;

create policy feedback_admin_read on public.feedback
  for select to authenticated
  using (public.is_admin());
