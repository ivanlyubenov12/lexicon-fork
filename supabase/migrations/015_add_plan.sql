-- Add plan to classes
alter table classes add column if not exists plan text check (plan in ('basic', 'premium'));
