-- Add is_seed flag to students so dev-seeded profiles can be cleared
-- without touching real students, questionnaire, polls, or other class data.
alter table students add column if not exists is_seed boolean not null default false;
