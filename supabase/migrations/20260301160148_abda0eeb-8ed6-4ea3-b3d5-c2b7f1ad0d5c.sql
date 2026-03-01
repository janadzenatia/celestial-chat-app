
CREATE TABLE public.daily_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  insight_date DATE NOT NULL DEFAULT CURRENT_DATE,
  language TEXT NOT NULL DEFAULT 'en',
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Unique constraint: one insight per user per day per language
ALTER TABLE public.daily_insights ADD CONSTRAINT unique_user_date_lang UNIQUE (user_id, insight_date, language);

-- Enable RLS
ALTER TABLE public.daily_insights ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own insights" ON public.daily_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own insights" ON public.daily_insights FOR INSERT WITH CHECK (auth.uid() = user_id);
