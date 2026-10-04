-- ─────────────────────────────────────────────────────────────────────────────
-- Two things Supabase's Security Advisor flagged that were really ours to fix.
--
-- 1. `public.applied_migrations` — CRITICAL, "RLS disabled in public".
--
--    `scripts/supabase-setup.mjs` creates it to remember which migrations have
--    run. It is in `public`, so PostgREST serves it, and Supabase's default
--    privileges had handed `anon` and `authenticated` every right on it —
--    select, insert, update, delete, truncate. Anybody holding the publishable
--    key (every page ships it) could read the list, and worse, *write* it: one
--    inserted name and a future migration is skipped as "already applied" for
--    ever — a security fix that never reaches the database and says nothing.
--
--    Only the setup script touches it, through the Management API as the
--    database owner, which neither RLS nor these grants affect. So RLS goes on
--    with **no** policy and both client roles lose every grant: the table is
--    invisible to the API, and the script works exactly as before.
--
--    Guarded by `to_regclass`, because the table is the script's, not a
--    migration's: `supabase db push` on a fresh project would reach this file
--    without it ever having been created.
--
-- 2. `public.set_updated_at()` — "function search path mutable".
--
--    A trigger function that runs as the invoker and only calls `now()`, so
--    not a hole. Pinning its search_path costs one line and takes it off the
--    list, which keeps the list short enough that the next real finding shows.
--
-- Left as flagged, on purpose: the two "security definer view" findings,
-- `lesson_outline` (§5.1) and `project_showcase` (§5). Owner-invoked is the
-- point of both — each projects away columns the caller may not read.
-- ─────────────────────────────────────────────────────────────────────────────

begin;

do $$
begin
  if to_regclass('public.applied_migrations') is not null then
    alter table public.applied_migrations enable row level security;
    revoke all on table public.applied_migrations from anon, authenticated;
  end if;
end
$$;

alter function public.set_updated_at() set search_path = public, pg_temp;

-- Asserted, not assumed (see 20261004000200 for why).
do $$
begin
  if to_regclass('public.applied_migrations') is not null
     and (has_table_privilege('anon', 'public.applied_migrations', 'select')
       or has_table_privilege('anon', 'public.applied_migrations', 'insert')
       or has_table_privilege('authenticated', 'public.applied_migrations', 'insert')) then
    raise exception 'applied_migrations is still reachable by a client role';
  end if;
end
$$;

commit;
