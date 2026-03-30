-- Update plan constraint: add 'free' and 'pro', keep backward-compat 'basic'/'premium'
alter table classes drop constraint if exists classes_plan_check;
alter table classes add constraint classes_plan_check
  check (plan in ('free', 'basic', 'pro', 'premium'));

-- Default unset plans to 'free'
update classes set plan = 'free' where plan is null;

-- Payments history table
create table if not exists payments (
  id              uuid primary key default gen_random_uuid(),
  class_id        uuid not null references classes(id) on delete cascade,
  moderator_id    uuid not null references auth.users(id),
  stripe_payment_id text,
  plan            text not null check (plan in ('free', 'basic', 'pro', 'premium')),
  amount_cents    integer,
  currency        text default 'bgn',
  status          text not null default 'succeeded'
                    check (status in ('succeeded', 'pending', 'failed', 'refunded')),
  created_at      timestamptz default now()
);
