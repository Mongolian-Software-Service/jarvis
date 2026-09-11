-- ─────────────────────────────────────────────────────────────────────────────
-- Jarvis — schema.
--
-- An online coding school: a small newsroom-sized team publishes courses, and
-- students work through them. One migration per change, forward only.
--
-- Shape of the content: course → module → lesson, with a lesson carrying any
-- of four things (video, written body, code, quiz). A lesson is not four
-- different tables because a real lesson is usually three of them at once —
-- watch this, read the notes, run the code, answer two questions.
-- ─────────────────────────────────────────────────────────────────────────────

-- gen_random_uuid() lives here. Supabase enables it by default; named anyway so
-- a fresh local `supabase db reset` matches the hosted project.
create extension if not exists pgcrypto with schema extensions;

-- ── Enums ────────────────────────────────────────────────────────────────────

-- Two roles, and only two. A teacher who is not an admin is a person, not a
-- permission: the team is small enough that everyone who edits, edits everything.
create type public.user_role as enum ('student', 'admin');

create type public.course_level as enum ('beginner', 'intermediate', 'advanced');

-- What the lesson screen leads with. Not what it contains — a `video` lesson
-- normally has a written body under the player as well.
create type public.lesson_kind as enum ('video', 'text', 'code', 'quiz');

-- How somebody came to have access. `purchase` is a settled payment, `grant` is
-- an admin opening a course by hand, `free` is a course with price 0.
create type public.enrollment_source as enum ('purchase', 'grant', 'free');

create type public.payment_status as enum ('pending', 'paid', 'failed', 'expired');

-- ── Slugs ────────────────────────────────────────────────────────────────────
--
-- Lowercase Latin kebab-case, enforced by the database rather than by a comment
-- in the editor. A Cyrillic slug percent-encodes into noise in the address bar
-- and in every link anyone ever shares, so it can never be saved at all.
create domain public.slug as text check (value ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');

-- ── profiles ─────────────────────────────────────────────────────────────────
--
-- One row per auth.users row, created by the trigger in 000200. The app never
-- reads auth.users directly: it is not in the exposed schema, and every join a
-- feature wants (who wrote this, who is enrolled) is against this table.
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  role        public.user_role not null default 'student',
  -- The language this person last chose, so the phone and the web agree without
  -- either of them owning the preference.
  locale      text not null default 'mn' check (locale in ('mn', 'en')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on column public.profiles.role is
  'Authorisation. Column-level UPDATE is revoked from authenticated in 000300 — a
   student cannot promote themselves by writing to their own profile row.';

-- ── courses ──────────────────────────────────────────────────────────────────
create table public.courses (
  id             uuid primary key default gen_random_uuid(),
  slug           public.slug unique not null,
  title_mn       text not null,
  title_en       text,
  summary_mn     text not null,
  summary_en     text,
  description_mn text,
  description_en text,
  level          public.course_level not null default 'beginner',
  -- The technology taught, as a plain tag: 'javascript', 'python', 'react'.
  -- A tag, not an enum: the curriculum will grow faster than a migration can.
  topic          text not null default 'general',
  cover_url      text,
  -- Integer tögrög. Money never touches a float, and MNT has no minor unit in
  -- practice, so there is nothing to divide by 100.
  price_mnt      integer not null default 0 check (price_mnt >= 0),
  is_published   boolean not null default false,
  rank           integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ── modules ──────────────────────────────────────────────────────────────────
create table public.modules (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid not null references public.courses (id) on delete cascade,
  title_mn   text not null,
  title_en   text,
  -- Deliberately not unique per course: reordering a syllabus by hand would
  -- otherwise have to route around a constraint on the way past itself.
  rank       integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── lessons ──────────────────────────────────────────────────────────────────
create table public.lessons (
  id               uuid primary key default gen_random_uuid(),
  module_id        uuid not null references public.modules (id) on delete cascade,
  -- Denormalised from the module, and kept honest by a trigger in 000200.
  -- Every access check, every progress row and every "next lesson" query is
  -- per course; making each of them walk through modules to find out which
  -- course they are in is a join on the hottest path in the product.
  course_id        uuid not null references public.courses (id) on delete cascade,
  slug             public.slug not null,
  title_mn         text not null,
  title_en         text,
  kind             public.lesson_kind not null default 'video',
  video_url        text,
  duration_minutes integer not null default 0 check (duration_minutes >= 0),
  -- Markdown. Rendered by packages/core's parser on both platforms, so the
  -- same lesson reads the same on the web and on the phone.
  body_mn          text,
  body_en          text,
  code_language    text,
  starter_code     text,
  solution_code    text,
  -- A lesson anybody may read without enrolling. The course page needs a few
  -- of these or nobody can tell what they would be buying.
  is_preview       boolean not null default false,
  rank             integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  unique (course_id, slug),

  -- A lesson that leads with a video and has no video is a broken screen, and
  -- the editor is where that should be caught, not the player.
  constraint lesson_video_needs_url check (kind <> 'video' or video_url is not null),
  constraint lesson_text_needs_body check (kind <> 'text' or body_mn is not null),
  constraint lesson_code_needs_code check (kind <> 'code' or starter_code is not null)
);

-- ── quiz_questions ───────────────────────────────────────────────────────────
--
-- Multiple choice, one right answer. `options_mn` is a text[] rather than jsonb:
-- the shape never varies, and an array is something Postgres can check.
create table public.quiz_questions (
  id             uuid primary key default gen_random_uuid(),
  lesson_id      uuid not null references public.lessons (id) on delete cascade,
  prompt_mn      text not null,
  prompt_en      text,
  options_mn     text[] not null,
  options_en     text[],
  correct_index  smallint not null,
  explanation_mn text,
  explanation_en text,
  rank           integer not null default 0,
  created_at     timestamptz not null default now(),

  constraint quiz_needs_two_options check (array_length(options_mn, 1) >= 2),
  constraint quiz_answer_in_range check (
    correct_index >= 0 and correct_index < array_length(options_mn, 1)
  ),
  -- A translated question with a different number of answers is a question
  -- whose correct index means something else in the other language.
  constraint quiz_translation_matches check (
    options_en is null or array_length(options_en, 1) = array_length(options_mn, 1)
  )
);

-- ── enrollments ──────────────────────────────────────────────────────────────
--
-- `user_id` references `public.profiles`, not `auth.users`, throughout this
-- file. Same rows either way — a profile exists for every account and dies with
-- it — but `auth.users` is not in the exposed schema, so PostgREST cannot see a
-- relationship to it and `payments?select=...,profiles(full_name)` comes back as
-- "could not find the relation". Every screen that shows who did something
-- needs that join.
create table public.enrollments (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  course_id  uuid not null references public.courses (id) on delete cascade,
  source     public.enrollment_source not null default 'grant',
  -- null = no expiry. A course sold once is access for good unless somebody
  -- deliberately sets a date.
  expires_at timestamptz,
  created_at timestamptz not null default now(),

  unique (user_id, course_id)
);

-- ── lesson_progress ──────────────────────────────────────────────────────────
create table public.lesson_progress (
  user_id         uuid not null references public.profiles (id) on delete cascade,
  lesson_id       uuid not null references public.lessons (id) on delete cascade,
  course_id       uuid not null references public.courses (id) on delete cascade,
  completed_at    timestamptz,
  -- Where the player should pick up. Seconds, because that is what a <video>
  -- element reports.
  seconds_watched integer not null default 0 check (seconds_watched >= 0),
  quiz_score      smallint check (quiz_score between 0 and 100),
  updated_at      timestamptz not null default now(),

  primary key (user_id, lesson_id)
);

-- ── payments ─────────────────────────────────────────────────────────────────
create table public.payments (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  -- restrict, not cascade: deleting a course must not quietly delete the
  -- record of money that changed hands for it.
  course_id  uuid not null references public.courses (id) on delete restrict,
  amount_mnt integer not null check (amount_mnt >= 0),
  provider   text not null default 'bonum',
  invoice_id text,
  status     public.payment_status not null default 'pending',
  -- Whatever the gateway said, kept verbatim for the console and for the
  -- support call six months from now.
  raw        jsonb,
  created_at timestamptz not null default now(),
  paid_at    timestamptz,

  constraint payment_paid_needs_date check (status <> 'paid' or paid_at is not null)
);

-- One row per invoice. The callback can arrive twice — gateways retry — and
-- without this the second delivery would mint a second payment row.
create unique index payments_invoice_key
  on public.payments (provider, invoice_id)
  where invoice_id is not null;

-- ── Indexes ──────────────────────────────────────────────────────────────────
create index courses_published_idx  on public.courses (is_published, rank);
create index modules_course_idx     on public.modules (course_id, rank);
create index lessons_course_idx     on public.lessons (course_id, rank);
create index lessons_module_idx     on public.lessons (module_id, rank);
create index quiz_lesson_idx        on public.quiz_questions (lesson_id, rank);
create index enrollments_user_idx   on public.enrollments (user_id, created_at desc);
create index enrollments_course_idx on public.enrollments (course_id);
create index progress_user_idx      on public.lesson_progress (user_id, course_id);
create index payments_user_idx      on public.payments (user_id, created_at desc);
create index payments_status_idx    on public.payments (status, created_at desc);
create index profiles_role_idx      on public.profiles (role);

-- Search over course titles in both languages. `simple`, not `english`:
-- Postgres has no Mongolian stemmer and the English one mangles Cyrillic tokens.
create index courses_search_idx on public.courses using gin (
  to_tsvector('simple',
    coalesce(title_mn, '') || ' ' || coalesce(title_en, '') || ' ' ||
    coalesce(summary_mn, '') || ' ' || coalesce(summary_en, ''))
);
