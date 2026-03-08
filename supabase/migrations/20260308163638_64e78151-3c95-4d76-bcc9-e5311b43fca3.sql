
-- Add subscription tier columns to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS subscription_plan text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS trial_end_date timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS daily_chat_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_chat_date date DEFAULT NULL;

-- Update the handle_new_user function to grant 3-day pro trial on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, subscription_plan, trial_end_date)
  VALUES (NEW.id, 'pro_premium', now() + interval '3 days');
  RETURN NEW;
END;
$function$;
