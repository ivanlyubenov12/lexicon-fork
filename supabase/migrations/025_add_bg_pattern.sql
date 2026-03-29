-- Add selectable background pattern to classes (independent of template/questionnaire)
ALTER TABLE classes
  ADD COLUMN IF NOT EXISTS bg_pattern TEXT DEFAULT 'school';
