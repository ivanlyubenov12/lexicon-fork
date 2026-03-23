-- Migration 007: Add moderator_note to answers
alter table answers add column if not exists moderator_note text;
