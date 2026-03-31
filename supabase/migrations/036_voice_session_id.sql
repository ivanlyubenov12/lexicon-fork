alter table class_voice_answers
  add column if not exists session_id text;

create index if not exists class_voice_answers_session_id_idx
  on class_voice_answers (session_id);
