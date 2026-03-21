CREATE TABLE public.cosmic_hooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  hook_date date NOT NULL DEFAULT CURRENT_DATE,
  language text NOT NULL DEFAULT 'en',
  hook text NOT NULL,
  subject text NOT NULL DEFAULT 'self',
  subject_dob text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, hook_date, language)
);

ALTER TABLE public.cosmic_hooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own hooks" ON public.cosmic_hooks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own hooks" ON public.cosmic_hooks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own hooks" ON public.cosmic_hooks FOR DELETE TO authenticated USING (auth.uid() = user_id);