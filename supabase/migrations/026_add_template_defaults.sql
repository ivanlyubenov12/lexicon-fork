-- Table to store default theme and bg_pattern per question preset
create table if not exists template_defaults (
  preset_id   text primary key,
  theme_id    text not null default 'classic',
  bg_pattern  text not null default 'school'
);

-- Insert default rows for all three presets
insert into template_defaults (preset_id, theme_id, bg_pattern) values
  ('primary',      'classic',      'school'),
  ('kindergarten', 'kindergarten', 'kindergarten'),
  ('teens',        'teens',        'teens')
on conflict (preset_id) do nothing;

-- Add theme_id column to classes so theme is independent of template preset
alter table classes add column if not exists theme_id text;
