-- Migration 001: Initial schema for Lexicon
-- Run this in Supabase → SQL Editor

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ─── CLASSES ──────────────────────────────────────────────────────────────────
create table classes (
  id                  uuid primary key default gen_random_uuid(),
  moderator_id        uuid not null references auth.users(id),
  name                text not null,
  school_year         text not null,
  status              text not null default 'draft'
                        check (status in ('draft','active','ready_for_payment','pending_payment','published')),
  stripe_payment_id   text,
  finalized_at        timestamptz,
  superhero_prompt    text,
  superhero_image_url text,
  created_at          timestamptz default now()
);

-- ─── STUDENTS ─────────────────────────────────────────────────────────────────
create table students (
  id                  uuid primary key default gen_random_uuid(),
  class_id            uuid not null references classes(id) on delete cascade,
  parent_user_id      uuid references auth.users(id),
  first_name          text not null,
  last_name           text not null,
  photo_url           text,
  invite_token        text not null unique default gen_random_uuid()::text,
  invite_accepted_at  timestamptz,
  created_at          timestamptz default now()
);

-- ─── QUESTIONS ────────────────────────────────────────────────────────────────
create table questions (
  id            uuid primary key default gen_random_uuid(),
  class_id      uuid references classes(id) on delete cascade,  -- null = system question
  text          text not null,
  type          text not null check (type in ('personal','class_voice','better_together','superhero')),
  is_system     boolean not null default false,
  allows_text   boolean not null default true,
  allows_media  boolean not null default true,
  order_index   integer not null default 0,
  created_at    timestamptz default now()
);

-- ─── ANSWERS ──────────────────────────────────────────────────────────────────
create table answers (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references students(id) on delete cascade,
  question_id   uuid not null references questions(id),
  text_content  text,
  media_url     text,
  media_type    text check (media_type in ('video','audio')),
  status        text not null default 'draft' check (status in ('draft','submitted','approved')),
  updated_at    timestamptz default now(),
  unique (student_id, question_id)
);

-- ─── PEER MESSAGES ────────────────────────────────────────────────────────────
create table peer_messages (
  id                    uuid primary key default gen_random_uuid(),
  recipient_student_id  uuid not null references students(id) on delete cascade,
  author_student_id     uuid not null references students(id) on delete cascade,
  content               text not null,
  status                text not null default 'pending' check (status in ('pending','approved','rejected')),
  moderated_at          timestamptz,
  created_at            timestamptz default now()
);

-- ─── CLASS VOICE ANSWERS (anonymous) ─────────────────────────────────────────
create table class_voice_answers (
  id          uuid primary key default gen_random_uuid(),
  class_id    uuid not null references classes(id) on delete cascade,
  question_id uuid not null references questions(id),
  content     text not null,
  created_at  timestamptz default now()
  -- NO student_id — anonymity guaranteed at DB level
);

-- ─── RLS ──────────────────────────────────────────────────────────────────────
alter table classes           enable row level security;
alter table students          enable row level security;
alter table questions         enable row level security;
alter table answers           enable row level security;
alter table peer_messages     enable row level security;
alter table class_voice_answers enable row level security;

-- TODO: add RLS policies per role (moderator, parent, reader)
-- See Specs_Lex.md section 8 for rules

-- ─── SEED: SYSTEM QUESTIONS ───────────────────────────────────────────────────
-- These have class_id = null and apply to every class
insert into questions (text, type, is_system, allows_text, allows_media, order_index) values
  ('Кажи ни нещо за себе си — кой си ти?',                          'personal', true, false, true,  1),
  ('Какво те прави щастлив/а?',                                      'personal', true, true,  true,  2),
  ('Ако беше животно, кое животно щеше да бъдеш и защо?',           'personal', true, true,  true,  3),
  ('Какво правиш най-добре от всичко?',                              'personal', true, true,  false, 4),
  ('Покажи ни нещо, което обичаш да правиш!',                       'personal', true, false, true,  5),
  ('Кое е любимото ти място в целия свят?',                         'personal', true, true,  true,  6),
  ('Какво е нещото, което те прави специален/а в нашия клас?',      'personal', true, true,  false, 7),
  ('Кажи нещо хубаво на класа си.',                                 'personal', true, false, true,  8),
  ('Какво искаш да станеш, когато пораснеш?',                       'personal', true, true,  true,  9),
  ('Какво е твоето училище за теб?',                                'personal', true, true,  true,  10),
  ('Ако класната беше супергерой — какви сили би имала?',           'superhero', true, true, false, 11),
  ('Едно нещо, което искам да подобря в себе си следващата година', 'better_together', true, true, false, 12),
  ('Едно нещо, което ценя най-много в нашия клас',                  'better_together', true, true, false, 13);
