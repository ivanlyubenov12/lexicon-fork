-- Allow upsert by (question_id, student_id) for all voice answers
-- First remove any duplicate anonymous entries per student/question
delete from class_voice_answers a
using class_voice_answers b
where a.id < b.id
  and a.question_id = b.question_id
  and a.student_id = b.student_id
  and a.student_id is not null;

-- Add unique constraint so upsert works
alter table class_voice_answers
  drop constraint if exists class_voice_answers_question_id_student_id_key;

alter table class_voice_answers
  add constraint class_voice_answers_question_id_student_id_key
  unique (question_id, student_id);
