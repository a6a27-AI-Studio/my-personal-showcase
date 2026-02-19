-- Update messages table to match frontend fields
-- Drop extra columns
ALTER TABLE messages
  DROP COLUMN IF EXISTS name;

ALTER TABLE messages
  DROP COLUMN IF EXISTS email;

-- Rename subject to title
ALTER TABLE messages
  RENAME COLUMN subject TO title;;
