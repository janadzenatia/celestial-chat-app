
-- Add service-role-only RLS policies to trial_history table
CREATE POLICY "Service role can select trial history"
  ON public.trial_history FOR SELECT
  TO public
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can insert trial history"
  ON public.trial_history FOR INSERT
  TO public
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update trial history"
  ON public.trial_history FOR UPDATE
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can delete trial history"
  ON public.trial_history FOR DELETE
  TO public
  USING (auth.role() = 'service_role');
