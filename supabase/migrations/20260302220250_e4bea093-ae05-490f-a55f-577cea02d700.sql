
-- Create table to cache monthly cosmic calendar data
CREATE TABLE public.cosmic_calendars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  days JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, month, year, language)
);

ALTER TABLE public.cosmic_calendars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own calendars"
ON public.cosmic_calendars FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calendars"
ON public.cosmic_calendars FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendars"
ON public.cosmic_calendars FOR DELETE
USING (auth.uid() = user_id);
