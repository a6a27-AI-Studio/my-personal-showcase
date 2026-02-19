-- Update portfolio_items table to match frontend fields
-- Rename thumbnail_url to cover_image_url
ALTER TABLE portfolio_items
  RENAME COLUMN thumbnail_url TO cover_image_url;

-- Add problem and solution columns
ALTER TABLE portfolio_items
  ADD COLUMN IF NOT EXISTS problem text;

ALTER TABLE portfolio_items
  ADD COLUMN IF NOT EXISTS solution text;

-- Drop columns not used in frontend
ALTER TABLE portfolio_items
  DROP COLUMN IF EXISTS image_urls;

ALTER TABLE portfolio_items
  DROP COLUMN IF EXISTS description;

ALTER TABLE portfolio_items
  DROP COLUMN IF EXISTS start_date;

ALTER TABLE portfolio_items
  DROP COLUMN IF EXISTS end_date;

-- Convert impact from jsonb to text array if needed
-- Note: This will clear existing impact data
ALTER TABLE portfolio_items
  DROP COLUMN IF EXISTS impact;

ALTER TABLE portfolio_items
  ADD COLUMN impact text[] DEFAULT ARRAY[]::text[];;
