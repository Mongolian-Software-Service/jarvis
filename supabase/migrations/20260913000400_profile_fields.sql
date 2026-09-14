-- ─────────────────────────────────────────────────────────────────────────────
-- Овог, нэр, утасны дугаар.
--
-- `full_name` was one box holding whatever the provider gave. A Mongolian name
-- is two parts and the order matters: овог first, нэр second — so «Батбаярын
-- Тэмүүлэн» greeted by its first word says the clan, not the person. Two
-- columns, and greeting somebody by `first_name` becomes correct rather than
-- lucky.
--
-- `full_name` stays: it is what Google hands over, what the admin list shows
-- for an account that signed up before this, and the fallback when the two
-- parts are empty. Nothing reads it in preference to them.
--
-- The phone is the school's only reliable way to reach a student — a Mongolian
-- inbox goes unread for weeks and a payment problem does not wait that long.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name  text,
  -- Eight digits, stored without spacing or country code so two people who
  -- typed it differently are one number. The form normalises; this refuses.
  add column if not exists phone      text
    check (phone is null or phone ~ '^[0-9]{8}$');

/*
 * Backfill what can be known.
 *
 * A single-word `full_name` is a given name far more often than a surname, so
 * it becomes `first_name`. Two words are read in Mongolian order. Anything
 * longer is left alone rather than guessed at — the account will be asked.
 */
update public.profiles
   set first_name = coalesce(first_name, nullif(split_part(trim(full_name), ' ', 2), '')),
       last_name  = coalesce(last_name,  nullif(split_part(trim(full_name), ' ', 1), ''))
 where full_name is not null
   and array_length(string_to_array(trim(full_name), ' '), 1) = 2
   and (first_name is null or last_name is null);

update public.profiles
   set first_name = coalesce(first_name, nullif(trim(full_name), ''))
 where full_name is not null
   and array_length(string_to_array(trim(full_name), ' '), 1) = 1
   and first_name is null;

-- The three are the account's own to edit. `role` is still not on this list,
-- and that omission is the whole security of it (§5).
grant update (email, full_name, first_name, last_name, phone, avatar_url, locale)
  on public.profiles to authenticated;

/*
 * Google hands over the parts already split — `given_name` and `family_name`
 * are separate claims — so an account that arrives that way starts complete
 * except for the phone, which no provider knows.
 */
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, email, full_name, first_name, last_name, avatar_url, role)
  values (
    new.id,
    new.email,
    nullif(trim(coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      ''
    )), ''),
    nullif(trim(coalesce(
      new.raw_user_meta_data ->> 'first_name',
      new.raw_user_meta_data ->> 'given_name',
      ''
    )), ''),
    nullif(trim(coalesce(
      new.raw_user_meta_data ->> 'last_name',
      new.raw_user_meta_data ->> 'family_name',
      ''
    )), ''),
    new.raw_user_meta_data ->> 'avatar_url',
    -- The role, and only the role, is never read from metadata: a signed-in
    -- user can write their own. It comes from the owner list (§5).
    case
      when exists (select 1 from public.admin_emails a where a.email = lower(new.email))
        then 'admin'::public.user_role
      else 'student'::public.user_role
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
