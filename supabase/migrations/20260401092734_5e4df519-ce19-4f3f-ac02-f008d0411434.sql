ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS cached_sun_sign text,
ADD COLUMN IF NOT EXISTS cached_moon_sign text,
ADD COLUMN IF NOT EXISTS cached_rising_sign text,
ADD COLUMN IF NOT EXISTS cached_sun_emoji text,
ADD COLUMN IF NOT EXISTS cached_moon_emoji text,
ADD COLUMN IF NOT EXISTS cached_rising_emoji text;