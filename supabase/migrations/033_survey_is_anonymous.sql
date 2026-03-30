-- Add is_anonymous flag to questions (survey type)
-- and student_id to class_voice_answers for non-anonymous tracking

ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS is_anonymous boolean NOT NULL DEFAULT true;

-- Allow storing the voter for non-anonymous survey answers
ALTER TABLE class_voice_answers
  ADD COLUMN IF NOT EXISTS student_id uuid REFERENCES students(id) ON DELETE SET NULL;

-- Unique constraint so a student can only have one answer per non-anonymous question
-- (used by the upsert in submitClassVoiceAnswer)
CREATE UNIQUE INDEX IF NOT EXISTS class_voice_answers_student_question_uq
  ON class_voice_answers (question_id, student_id)
  WHERE student_id IS NOT NULL;
