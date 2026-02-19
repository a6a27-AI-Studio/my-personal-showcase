-- Update site_about table to match frontend fields
-- Rename columns
ALTER TABLE site_about 
  RENAME COLUMN title TO headline;

ALTER TABLE site_about 
  RENAME COLUMN subtitle TO subheadline;

ALTER TABLE site_about
  RENAME COLUMN profile_image_url TO avatar_url;

-- Add missing columns
ALTER TABLE site_about
  ADD COLUMN IF NOT EXISTS highlights text[] DEFAULT ARRAY[]::text[];

-- Rename social_links to links
ALTER TABLE site_about
  RENAME COLUMN social_links TO links;;
