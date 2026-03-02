CREATE TABLE public.relationship_forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  partner_dob text NOT NULL,
  relationship_date text NOT NULL,
  language text NOT NULL DEFAULT 'en',
  periods jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, partner_dob, relationship_date, language)
);

ALTER TABLE public.relationship_forecasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own forecasts" ON public.relationship_forecasts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own forecasts" ON public.relationship_forecasts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own forecasts" ON public.relationship_forecasts FOR DELETE TO authenticated USING (auth.uid() = user_id);