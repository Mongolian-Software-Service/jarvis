-- ─────────────────────────────────────────────────────────────────────────────
-- One payment, every course.
--
-- The offer changed: instead of four courses at four prices, there is one price
-- and everything is behind it. The content model (§1) is untouched — course →
-- module → lesson still — and so is the access model: holding a course is still
-- a row in `enrollments`. What changes is how those rows come to exist.
--
-- A bundle payment names no single course, so `payments.course_id` becomes
-- nullable and a null there means "all of them". That is a smaller change than
-- a `products` table, and it keeps `settle_payment` the only thing that turns
-- money into access.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.payments alter column course_id drop not null;

comment on column public.payments.course_id is
  'The course bought, or NULL for the bundle — which enrols the buyer in every
   published course at the moment the payment settles. Later courses need
   granting separately; see settle_payment.';

-- ── settle_payment, taught about bundles ─────────────────────────────────────
--
-- Same contract as before: idempotent, one transaction, the only path from a
-- paid invoice to an enrolment. The single-course branch is unchanged; the new
-- branch enrols in everything published.
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
    if row.course_id is null then
      /*
       * The bundle. One row per published course, in one statement — a loop
       * here would be a loop that can fail halfway and leave somebody holding
       * three of five courses they paid for.
       */
      insert into public.enrollments (user_id, course_id, source)
      select row.user_id, c.id, 'purchase'
        from public.courses c
       where c.is_published
      on conflict (user_id, course_id)
        do update set source = 'purchase', expires_at = null;
    else
      insert into public.enrollments (user_id, course_id, source)
      values (row.user_id, row.course_id, 'purchase')
      on conflict (user_id, course_id)
        -- Somebody granted access who then bought it: the purchase is the
        -- stronger claim, and it clears any expiry the grant had.
        do update set source = 'purchase', expires_at = null;
    end if;
  end if;

  return row.id;
end;
$$;

-- The grant is per-signature, and the signature did not change — but the
-- function was replaced, so state it again rather than assume.
revoke all on function public.settle_payment(text, public.payment_status, jsonb, text) from public;
grant execute on function public.settle_payment(text, public.payment_status, jsonb, text) to service_role;

-- ── Opening the bundle to somebody by hand ───────────────────────────────────
--
-- The admin console's "open a course" grants one. This grants the lot, which is
-- what "they paid offline" now means. Admin-only, checked inside — the console
-- is not the gate, this is.
create or replace function public.grant_all_courses(p_user uuid)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  granted integer;
begin
  if not public.is_admin() then
    raise exception 'Зөвхөн админ эрх олгоно' using errcode = '42501';
  end if;

  insert into public.enrollments (user_id, course_id, source)
  select p_user, c.id, 'grant'
    from public.courses c
   where c.is_published
  on conflict (user_id, course_id) do nothing;

  get diagnostics granted = row_count;
  return granted;
end;
$$;
