
-- Add partner time of birth, place of birth, and relationship start date to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS partner_time_of_birth time without time zone DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS partner_place_of_birth text DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS relationship_start_date date DEFAULT NULL;
