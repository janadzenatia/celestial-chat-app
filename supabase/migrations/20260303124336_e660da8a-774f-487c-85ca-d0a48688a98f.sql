
-- Add partner fields to profiles table (1-on-1 relationship)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS partner_name text,
  ADD COLUMN IF NOT EXISTS partner_birth_date date,
  ADD COLUMN IF NOT EXISTS partner_love_language text;
