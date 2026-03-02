CREATE TABLE public.synastry_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  partner_name text NOT NULL DEFAULT '',
  partner_dob text NOT NULL,
  partner_time text,
  language text NOT NULL DEFAULT 'en',
  overall_score integer NOT NULL DEFAULT 0,
  emotional jsonb NOT NULL DEFAULT '{}'::jsonb,
  romantic jsonb NOT NULL DEFAULT '{}'::jsonb,
  communication jsonb NOT NULL DEFAULT '{}'::jsonb,
  goals jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, partner_dob, language)
);

ALTER TABLE public.synastry_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own synastry" ON public.synastry_reports FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own synastry" ON public.synastry_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own synastry" ON public.synastry_reports FOR DELETE TO authenticated USING (auth.uid() = user_id);