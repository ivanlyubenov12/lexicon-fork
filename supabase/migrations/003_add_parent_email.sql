-- Migration 003: Add parent_email to students table
-- Needed to store parent contact before they register via invite link

alter table students add column parent_email text;

-- Note: RLS for this column is already covered by the existing policies in
-- 002_rls_policies.sql ("Moderator can manage students" — for all operations)
-- No additional policies needed.
