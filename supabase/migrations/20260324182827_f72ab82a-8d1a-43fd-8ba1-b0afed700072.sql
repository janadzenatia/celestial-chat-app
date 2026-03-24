
-- Enable pgcrypto for SHA256 hashing in handle_new_user trigger
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;

-- Update handle_new_user to use extensions.digest
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
  -- Hash the email for lookup using pgcrypto
  _email_hash := encode(extensions.digest(lower(NEW.email)::bytea, 'sha256'), 'hex');
  
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
