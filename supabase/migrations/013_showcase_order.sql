-- Migration 013: Add showcase_order to classes
-- Allows up to 3 classes to be featured on the public showcase page.
-- showcase_order = 1, 2, or 3 means featured; NULL means not featured.

ALTER TABLE classes ADD COLUMN IF NOT EXISTS showcase_order integer;

-- Only one class can hold each position
CREATE UNIQUE INDEX IF NOT EXISTS classes_showcase_order_unique
  ON classes (showcase_order)
  WHERE showcase_order IS NOT NULL;
