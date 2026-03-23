-- Migration 002: RLS policies
-- Run this in Supabase → SQL Editor after 001_initial_schema.sql

-- ─── CLASSES ──────────────────────────────────────────────────────────────────
-- Moderator can create their own class
create policy "Moderator can insert own class"
  on classes for insert
  with check (auth.uid() = moderator_id);

-- Moderator can read their own class
create policy "Moderator can read own class"
  on classes for select
  using (auth.uid() = moderator_id);

-- Moderator can update their own class
create policy "Moderator can update own class"
  on classes for update
  using (auth.uid() = moderator_id);

-- Parents and readers can read published classes they belong to (via students table)
create policy "Members can read their published class"
  on classes for select
  using (
    status = 'published'
    and exists (
      select 1 from students
      where students.class_id = classes.id
        and students.parent_user_id = auth.uid()
    )
  );

-- ─── STUDENTS ─────────────────────────────────────────────────────────────────
-- Moderator can manage students in their own class
create policy "Moderator can manage students"
  on students for all
  using (
    exists (
      select 1 from classes
      where classes.id = students.class_id
        and classes.moderator_id = auth.uid()
    )
  );

-- Parent can read their own child
create policy "Parent can read own child"
  on students for select
  using (parent_user_id = auth.uid());

-- ─── QUESTIONS ────────────────────────────────────────────────────────────────
-- Everyone can read system questions (class_id is null)
create policy "Anyone can read system questions"
  on questions for select
  using (class_id is null);

-- Members of a class can read that class's questions
create policy "Class members can read class questions"
  on questions for select
  using (
    class_id is not null
    and exists (
      select 1 from students
      where students.class_id = questions.class_id
        and students.parent_user_id = auth.uid()
    )
  );

-- Moderator can read questions for their class
create policy "Moderator can read own class questions"
  on questions for select
  using (
    class_id is not null
    and exists (
      select 1 from classes
      where classes.id = questions.class_id
        and classes.moderator_id = auth.uid()
    )
  );

-- ─── ANSWERS ──────────────────────────────────────────────────────────────────
-- Parent can manage answers for their own child
create policy "Parent can manage own child answers"
  on answers for all
  using (
    exists (
      select 1 from students
      where students.id = answers.student_id
        and students.parent_user_id = auth.uid()
    )
  );

-- Moderator can read and update (approve/reject) answers in their class
create policy "Moderator can manage answers in own class"
  on answers for all
  using (
    exists (
      select 1 from students
      join classes on classes.id = students.class_id
      where students.id = answers.student_id
        and classes.moderator_id = auth.uid()
    )
  );

-- ─── PEER MESSAGES ────────────────────────────────────────────────────────────
-- Parent can submit a message (as author)
create policy "Parent can submit peer message"
  on peer_messages for insert
  with check (
    exists (
      select 1 from students
      where students.id = peer_messages.author_student_id
        and students.parent_user_id = auth.uid()
    )
  );

-- Parent can read approved messages for their own child
create policy "Parent can read approved messages for own child"
  on peer_messages for select
  using (
    status = 'approved'
    and exists (
      select 1 from students
      where students.id = peer_messages.recipient_student_id
        and students.parent_user_id = auth.uid()
    )
  );

-- Moderator can manage all messages in their class
create policy "Moderator can manage peer messages"
  on peer_messages for all
  using (
    exists (
      select 1 from students
      join classes on classes.id = students.class_id
      where students.id = peer_messages.recipient_student_id
        and classes.moderator_id = auth.uid()
    )
  );

-- ─── CLASS VOICE ANSWERS ──────────────────────────────────────────────────────
-- Parent can submit anonymous answer (only while class is active)
create policy "Parent can submit class voice answer"
  on class_voice_answers for insert
  with check (
    exists (
      select 1 from students
      join classes on classes.id = students.class_id
      where students.class_id = class_voice_answers.class_id
        and students.parent_user_id = auth.uid()
        and classes.status = 'active'
    )
  );

-- Class members can read aggregated voice answers (for published class)
create policy "Members can read class voice answers"
  on class_voice_answers for select
  using (
    exists (
      select 1 from students
      join classes on classes.id = students.class_id
      where students.class_id = class_voice_answers.class_id
        and students.parent_user_id = auth.uid()
        and classes.status = 'published'
    )
  );
