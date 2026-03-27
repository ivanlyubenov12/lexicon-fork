-- Simplify class statuses:
-- draft      = questions being set up (unchanged)
-- filling    = collecting answers from parents (replaces active/ready_for_payment/pending_payment)
-- unpublished= answers collected and approved, ready to publish
-- published  = publicly visible (unchanged)

alter table classes drop constraint if exists classes_status_check;
alter table classes add constraint classes_status_check
  check (status in ('draft', 'filling', 'unpublished', 'published'));

-- Migrate existing rows
update classes set status = 'filling'
  where status in ('active', 'ready_for_payment', 'pending_payment');
