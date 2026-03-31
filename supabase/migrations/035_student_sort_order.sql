-- Add manual sort order to students
alter table students
  add column if not exists sort_order integer;

-- Back-fill with row_number() ordered by last_name per class
update students s
set sort_order = sub.rn
from (
  select id, row_number() over (partition by class_id order by last_name, first_name) as rn
  from students
) sub
where s.id = sub.id;
