CREATE TABLE public.token_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  function_name text NOT NULL,
  prompt_tokens integer NOT NULL DEFAULT 0,
  completion_tokens integer NOT NULL DEFAULT 0,
  total_tokens integer NOT NULL DEFAULT 0,
  model text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.token_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage token usage"
  ON public.token_usage FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE INDEX idx_token_usage_user_id ON public.token_usage(user_id);
CREATE INDEX idx_token_usage_function ON public.token_usage(function_name);
CREATE INDEX idx_token_usage_created ON public.token_usage(created_at);