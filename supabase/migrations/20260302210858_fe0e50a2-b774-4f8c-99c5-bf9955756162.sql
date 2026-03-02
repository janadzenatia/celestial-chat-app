
-- Table for saved children
CREATE TABLE public.children (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  date_of_birth date NOT NULL,
  time_of_birth time without time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own children" ON public.children FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own children" ON public.children FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own children" ON public.children FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can update own children" ON public.children FOR UPDATE USING (auth.uid() = user_id);

-- Table for child synastry reports
CREATE TABLE public.child_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  language text NOT NULL DEFAULT 'en',
  blueprint text NOT NULL DEFAULT '',
  emotional_connection text NOT NULL DEFAULT '',
  parenting_advice text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.child_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own child reports" ON public.child_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own child reports" ON public.child_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own child reports" ON public.child_reports FOR DELETE USING (auth.uid() = user_id);
