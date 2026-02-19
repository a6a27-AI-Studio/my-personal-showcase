-- Update skills table to match frontend fields
-- Rename columns
ALTER TABLE skills
  RENAME COLUMN proficiency_level TO level;

ALTER TABLE skills
  RENAME COLUMN icon_url TO icon;

-- Add tags column
ALTER TABLE skills
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT ARRAY[]::text[];;
