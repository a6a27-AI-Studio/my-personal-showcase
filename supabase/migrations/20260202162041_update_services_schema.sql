-- Update services table to match frontend fields
-- Rename columns
ALTER TABLE services
  RENAME COLUMN title TO name;

-- Add description column (separate from summary)
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS summary text;

-- Update existing description to summary
UPDATE services SET summary = description WHERE summary IS NULL;

-- Rename features to deliverables
ALTER TABLE services
  RENAME COLUMN features TO deliverables;

-- Add missing columns
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS process text[] DEFAULT ARRAY[]::text[];

ALTER TABLE services
  RENAME COLUMN icon_url TO icon;

ALTER TABLE services
  ADD COLUMN IF NOT EXISTS related_portfolio_ids uuid[] DEFAULT ARRAY[]::uuid[];;
