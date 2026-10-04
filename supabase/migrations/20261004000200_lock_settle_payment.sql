-- ─────────────────────────────────────────────────────────────────────────────
-- settle_payment belongs to the webhook, and to nobody else.
--
-- `settle_payment()` is `security definer` and checks nothing about its caller:
-- it marks an invoice paid and enrols the payer in every published course. The
-- grant was supposed to be the whole gate — `revoke … from public`, then
-- `grant … to service_role` (20260911000300, again in 20260913000100).
--
-- It was not shut. Supabase's default privileges hand `execute` on every new
-- function in `public` to `anon` and `authenticated` **by name**, and a revoke
-- from PUBLIC does not touch a named grant — the trap 20260913000700 already
-- fell into for `grant_all_courses`. There the function's own `is_admin()`
-- raise was still standing behind the gate. Here there is nothing behind it.
--
-- What that allowed, once Bonum's live keys were set on 2026-10-04: a signed-in
-- student presses «Бүгдийг нь авах», which writes their pending payment and its
-- Bonum `invoice_id`; reads that id back through `payments_read_own`; then calls
-- `rpc('settle_payment', { p_invoice_id, p_status: 'paid' })` with the
-- publishable key every page ships. Five courses, no money.
--
-- The only caller is `/api/webhooks/bonum`, through the service client, after
-- verifying Bonum's HMAC. So both client roles lose it, by name.
-- ─────────────────────────────────────────────────────────────────────────────

begin;

revoke all on function public.settle_payment(text, public.payment_status, jsonb, text) from public;
revoke all on function public.settle_payment(text, public.payment_status, jsonb, text) from anon;
revoke all on function public.settle_payment(text, public.payment_status, jsonb, text) from authenticated;
grant execute on function public.settle_payment(text, public.payment_status, jsonb, text) to service_role;

-- `set_user_role` raises on `is_admin()` inside, so this is not a hole — but
-- anon has no business reaching that raise. Same treatment as
-- grant_all_courses got in 20260913000700: the outer gate shut, the inner check
-- still the one that matters for signed-in callers.
--
-- Both revokes. Nothing had ever revoked PUBLIC's create-time default here
-- (unlike grant_all_courses, whose PUBLIC entry 000600 had already cleared), so
-- naming anon alone would leave anon reaching it through PUBLIC — and the check
-- below would roll this whole file back, settle_payment's fix with it.
revoke all on function public.set_user_role(uuid, public.user_role) from public;
revoke all on function public.set_user_role(uuid, public.user_role) from anon;
grant execute on function public.set_user_role(uuid, public.user_role) to authenticated;

-- Prove it rather than trust it. A migration that quietly leaves the gate open
-- is how this one came to be written; this one refuses to apply instead.
do $$
begin
  if has_function_privilege('anon', 'public.settle_payment(text, public.payment_status, jsonb, text)', 'execute')
     or has_function_privilege('authenticated', 'public.settle_payment(text, public.payment_status, jsonb, text)', 'execute') then
    raise exception 'settle_payment is still executable by a client role';
  end if;
  -- And the other way: a webhook locked out would take money and open nothing.
  if not has_function_privilege('service_role', 'public.settle_payment(text, public.payment_status, jsonb, text)', 'execute') then
    raise exception 'settle_payment is no longer executable by service_role';
  end if;
  if has_function_privilege('anon', 'public.set_user_role(uuid, public.user_role)', 'execute') then
    raise exception 'set_user_role is still executable by anon';
  end if;
  if not has_function_privilege('authenticated', 'public.set_user_role(uuid, public.user_role)', 'execute') then
    raise exception 'set_user_role is no longer executable by authenticated — the console needs it';
  end if;
end
$$;

commit;
