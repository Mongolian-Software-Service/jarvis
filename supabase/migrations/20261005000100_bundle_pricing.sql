-- ─────────────────────────────────────────────────────────────────────────────
-- The bundle's price, as one row the console can change.
--
-- It was three constants in packages/core (`BUNDLE_PRICE_MNT`,
-- `BUNDLE_LAUNCH_PRICE_MNT`, `BUNDLE_LAUNCH_LAST_DAY`), and their own comment
-- said what would replace them: "when the team wants to run a sale without
-- asking a developer, it becomes a row in a settings table". The owner asked
-- for exactly that on 2026-10-05. The values below are the ones the constants
-- held that day, so applying this changes nothing a buyer sees.
--
-- Still one price for everything (§1). This is not a price per course and
-- must not grow into one without an ADR.
--
-- - **One row, enforced**: the key is a boolean that can only be true, so a
--   second row is a primary-key violation rather than a question about which
--   price is real.
-- - **The launch is a pair**: a launch price without a last day, or the
--   reverse, is refused — half a launch is the struck-number lie again.
-- - **A launch price must be lower** than the regular one, or there is
--   nothing to strike through.
-- - **Read by anyone, changed only by an admin.** The price is printed on
--   public pages, so anon reads it. `update` is granted on the three price
--   columns and the policy asks `is_admin()`; nobody may insert or delete.
--   Checkout reads this row through the buyer's own client — the amount
--   still never comes from the request (§6.7).
-- ─────────────────────────────────────────────────────────────────────────────

begin;

create table if not exists public.bundle_pricing (
  id               boolean primary key default true
                     constraint bundle_pricing_single_row check (id),
  price_mnt        integer not null
                     constraint bundle_pricing_price_range check (price_mnt between 1000 and 100000000),
  launch_price_mnt integer,
  launch_last_day  date,
  updated_at       timestamptz not null default now(),
  constraint bundle_pricing_launch_pair
    check ((launch_price_mnt is null) = (launch_last_day is null)),
  constraint bundle_pricing_launch_lower
    check (launch_price_mnt is null or (launch_price_mnt >= 1000 and launch_price_mnt < price_mnt))
);

insert into public.bundle_pricing (id, price_mnt, launch_price_mnt, launch_last_day)
values (true, 499000, 199000, '2026-10-20')
on conflict (id) do nothing;

drop trigger if exists bundle_pricing_updated_at on public.bundle_pricing;
create trigger bundle_pricing_updated_at
  before update on public.bundle_pricing
  for each row execute function public.set_updated_at();

alter table public.bundle_pricing enable row level security;

drop policy if exists bundle_pricing_read on public.bundle_pricing;
create policy bundle_pricing_read on public.bundle_pricing
  for select to anon, authenticated
  using (true);

drop policy if exists bundle_pricing_admin_update on public.bundle_pricing;
create policy bundle_pricing_admin_update on public.bundle_pricing
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

revoke all on table public.bundle_pricing from anon, authenticated;
grant select on table public.bundle_pricing to anon, authenticated;
grant update (price_mnt, launch_price_mnt, launch_last_day)
  on table public.bundle_pricing to authenticated;

-- Asserted, not assumed (see 20261004000200 for why). `has_table_privilege`
-- is blind to column-level grants, so insert and update are asked per column
-- too — and `id` and `updated_at` are checked to be outside the update grant.
do $$
begin
  if has_any_column_privilege('anon', 'public.bundle_pricing', 'insert')
     or has_any_column_privilege('anon', 'public.bundle_pricing', 'update')
     or has_table_privilege('anon', 'public.bundle_pricing', 'delete')
     or has_any_column_privilege('authenticated', 'public.bundle_pricing', 'insert')
     or has_table_privilege('authenticated', 'public.bundle_pricing', 'delete')
     or has_column_privilege('authenticated', 'public.bundle_pricing', 'id', 'update')
     or has_column_privilege('authenticated', 'public.bundle_pricing', 'updated_at', 'update') then
    raise exception 'bundle_pricing is writable beyond its admin update policy';
  end if;
end
$$;

commit;
