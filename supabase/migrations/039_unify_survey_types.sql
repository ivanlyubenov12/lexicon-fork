-- Unify question types: merge 'class_voice' into 'survey'
-- After this migration:
--   type = 'survey' with voice_display != null  → old class_voice (word cloud / bar chart)
--   type = 'survey' with voice_display = null   → old survey (single-select poll)

-- Migrate existing class_voice rows to survey
update questions set type = 'survey' where type = 'class_voice';

-- Drop old constraint and re-add without class_voice
alter table questions drop constraint if exists questions_type_check;
alter table questions add constraint questions_type_check
  check (type in ('personal', 'better_together', 'superhero', 'video', 'photo', 'survey'));
