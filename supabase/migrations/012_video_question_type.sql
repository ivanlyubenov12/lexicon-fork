-- Migration 012: Add 'video' question type, simplify to text-only for all others
-- Run this in Supabase → SQL Editor

-- 1. Add 'video' to the type constraint
alter table questions
  drop constraint questions_type_check;

alter table questions
  add constraint questions_type_check
    check (type in ('personal', 'class_voice', 'better_together', 'superhero', 'video'));

-- 2. All existing questions become text-only (allows_media = false, allows_text = true)
update questions
  set allows_media = false,
      allows_text  = true
  where type != 'video';

-- 3. Any future 'video' type questions will have allows_text = false, allows_media = true
--    (enforced in app layer; no existing rows to update)
