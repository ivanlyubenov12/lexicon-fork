-- Add 'photo' question type
alter table questions drop constraint if exists questions_type_check;

alter table questions
  add constraint questions_type_check
    check (type in ('personal', 'class_voice', 'better_together', 'superhero', 'video', 'photo'));
