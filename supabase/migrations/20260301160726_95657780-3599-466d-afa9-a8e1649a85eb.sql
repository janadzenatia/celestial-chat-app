
CREATE TABLE public.cosmic_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  compatible_signs JSONB NOT NULL DEFAULT '[]',
  birth_years JSONB NOT NULL DEFAULT '[]',
  personality_profile TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- One match per user per language
ALTER TABLE public.cosmic_matches ADD CONSTRAINT unique_user_lang_match UNIQUE (user_id, language);

ALTER TABLE public.cosmic_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own matches" ON public.cosmic_matches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own matches" ON public.cosmic_matches FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own matches" ON public.cosmic_matches FOR DELETE USING (auth.uid() = user_id);
