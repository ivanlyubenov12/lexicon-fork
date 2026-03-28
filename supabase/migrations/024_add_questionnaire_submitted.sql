ALTER TABLE students
  ADD COLUMN IF NOT EXISTS questionnaire_submitted boolean NOT NULL DEFAULT false;
