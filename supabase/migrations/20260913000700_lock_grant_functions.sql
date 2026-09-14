-- ─────────────────────────────────────────────────────────────────────────────
-- Finishing the previous migration, which only half worked.
--
-- `revoke … from public` removed the PUBLIC entry from both functions' ACLs and
-- `revoke_all_courses` came out clean — but `grant_all_courses` still answered
-- `anon` with its own «Зөвхөн админ эрх олгоно» rather than "permission denied
-- for function", which is the tell that the call got past the grant layer.
--
-- Because there are **two** ways a role ends up with EXECUTE here, and they
-- have to be revoked separately:
--
--   1. PUBLIC, which every function is created with. Revoked in 000600.
--   2. An **explicit** per-role grant. Supabase's default privileges hand
--      `execute` on every new function in `public` to `anon`, `authenticated`
--      and `service_role` by name, and a revoke from PUBLIC does not touch a
--      named grant.
--
-- `revoke_all_courses` escaped only by accident: its own migration happened to
-- say `revoke … from anon, authenticated`, which cleared (2) for it and not for
-- the function it mirrors.
--
-- Neither was a hole — both raise on `is_admin()` inside the transaction, which
-- is the check that actually protects the school. This is the outer gate, and
-- it should be shut so the inner one is not the only thing standing.
-- ─────────────────────────────────────────────────────────────────────────────

revoke all on function public.grant_all_courses(uuid) from anon;
revoke all on function public.revoke_all_courses(uuid) from anon;

-- Said again rather than assumed: this is the one role that may call either,
-- and `authenticated` is still every signed-in student, so the `is_admin()`
-- check inside each function remains the thing that matters.
grant execute on function public.grant_all_courses(uuid) to authenticated;
grant execute on function public.revoke_all_courses(uuid) to authenticated;
