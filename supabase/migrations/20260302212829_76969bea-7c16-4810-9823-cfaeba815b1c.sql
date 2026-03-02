
CREATE TABLE public.wealth_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  language text NOT NULL DEFAULT 'en',
  cosmic_calling text NOT NULL DEFAULT '',
  wealth_dna text NOT NULL DEFAULT '',
  career_timeline text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.wealth_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wealth reports" ON public.wealth_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wealth reports" ON public.wealth_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own wealth reports" ON public.wealth_reports FOR DELETE USING (auth.uid() = user_id);
