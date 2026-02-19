-- Update resume_meta table to match frontend fields
-- Rename uploaded_at to updated_at
ALTER TABLE resume_meta
  RENAME COLUMN uploaded_at TO updated_at;

-- Drop columns not used in frontend
ALTER TABLE resume_meta
  DROP COLUMN IF EXISTS file_size_bytes;

ALTER TABLE resume_meta
  DROP COLUMN IF EXISTS is_current;;
