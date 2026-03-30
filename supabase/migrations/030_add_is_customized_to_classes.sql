-- Track whether a class has been customized from its template defaults.
-- Set to true on any manual change (theme, bg, questions, layout).
-- Reset to false when a fresh template is applied.
alter table classes add column if not exists is_customized boolean not null default false;
