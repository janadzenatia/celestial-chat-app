
-- Table to track trial usage across account deletions
CREATE TABLE public.trial_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_hash text NOT NULL,
  device_id text,
  trial_used boolean NOT NULL DEFAULT true,
  trial_start_date timestamptz,
  trial_end_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_trial_history_email_hash ON public.trial_history (email_hash);
CREATE INDEX idx_trial_history_device_id ON public.trial_history (device_id) WHERE device_id IS NOT NULL;

-- RLS: only service_role can access this table
ALTER TABLE public.trial_history ENABLE ROW LEVEL SECURITY;

-- Add device_id column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS device_id text;

-- Update handle_new_user to check trial history before granting trial
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _email_hash text;
  _has_used_trial boolean;
BEGIN
  -- Hash the email for lookup
  _email_hash := encode(digest(lower(NEW.email), 'sha256'), 'hex');
  
  -- Check if this email hash has used a trial before
  SELECT EXISTS (
    SELECT 1 FROM public.trial_history
    WHERE email_hash = _email_hash AND trial_used = true
  ) INTO _has_used_trial;
  
  IF _has_used_trial THEN
    -- No trial for returning users
    INSERT INTO public.profiles (user_id, subscription_plan, trial_end_date)
    VALUES (NEW.id, 'free', NULL);
  ELSE
    -- Grant 3-day trial for new users
    INSERT INTO public.profiles (user_id, subscription_plan, trial_end_date)
    VALUES (NEW.id, 'premium', now() + interval '3 days');
    
    -- Record trial usage immediately
    INSERT INTO public.trial_history (email_hash, trial_start_date, trial_end_date)
    VALUES (_email_hash, now(), now() + interval '3 days');
  END IF;
  
  RETURN NEW;
END;
$$;
