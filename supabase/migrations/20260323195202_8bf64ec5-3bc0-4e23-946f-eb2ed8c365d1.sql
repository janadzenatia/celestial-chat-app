ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS partner_birth_place_lat double precision;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS partner_birth_place_lon double precision;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS partner_birth_place_normalized text;