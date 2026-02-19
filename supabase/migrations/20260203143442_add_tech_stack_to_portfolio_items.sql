-- Add tech_stack column to portfolio_items table
ALTER TABLE portfolio_items 
ADD COLUMN tech_stack text[] DEFAULT ARRAY[]::text[];;
