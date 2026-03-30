-- Add 'survey' question type and poll_options column

-- Drop existing type constraint and re-add with 'survey'
alter table questions drop constraint if exists questions_type_check;
alter table questions add constraint questions_type_check
  check (type in ('personal', 'class_voice', 'better_together', 'superhero', 'video', 'photo', 'survey'));

-- Poll options for survey-type questions (array of strings stored as jsonb)
alter table questions add column if not exists poll_options jsonb;
