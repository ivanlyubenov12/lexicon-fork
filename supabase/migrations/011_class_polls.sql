-- Migration 011: Class polls (superlatives / group questions)
-- Run in Supabase → SQL Editor

-- ─── CLASS POLLS ──────────────────────────────────────────────────────────────
-- Poll questions defined by the moderator (e.g. "Най-голям шегаджия")
create table class_polls (
  id          uuid primary key default gen_random_uuid(),
  class_id    uuid not null references classes(id) on delete cascade,
  question    text not null,
  order_index integer not null default 0,
  created_at  timestamptz default now()
);

-- ─── CLASS POLL VOTES ─────────────────────────────────────────────────────────
-- Each student casts one vote per poll, nominating a classmate
create table class_poll_votes (
  id                  uuid primary key default gen_random_uuid(),
  poll_id             uuid not null references class_polls(id) on delete cascade,
  voter_student_id    uuid not null references students(id) on delete cascade,
  nominee_student_id  uuid not null references students(id) on delete cascade,
  created_at          timestamptz default now(),
  unique (poll_id, voter_student_id)   -- one vote per student per poll
);

-- ─── RLS ──────────────────────────────────────────────────────────────────────
alter table class_polls      enable row level security;
alter table class_poll_votes enable row level security;
