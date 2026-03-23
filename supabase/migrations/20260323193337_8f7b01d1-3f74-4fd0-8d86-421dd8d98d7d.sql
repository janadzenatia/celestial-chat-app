ALTER TABLE public.children ADD COLUMN IF NOT EXISTS birth_place text;
ALTER TABLE public.children ADD COLUMN IF NOT EXISTS birth_place_lat double precision;
ALTER TABLE public.children ADD COLUMN IF NOT EXISTS birth_place_lon double precision;