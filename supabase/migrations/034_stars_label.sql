-- Add stars_label column to classes (per-class override for "Звездите на...")
alter table classes
  add column if not exists stars_label text;
