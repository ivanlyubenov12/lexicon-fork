-- Migration 006: Add school_logo_url to classes
alter table classes add column if not exists school_logo_url text;
