
-- Trigger to prevent authenticated users from directly modifying subscription fields
CREATE OR REPLACE FUNCTION public.prevent_subscription_self_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Allow service_role to bypass this check
  IF current_setting('role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF NEW.is_premium IS DISTINCT FROM OLD.is_premium OR
     NEW.subscription_plan IS DISTINCT FROM OLD.subscription_plan OR
     NEW.subscription_status IS DISTINCT FROM OLD.subscription_status OR
     NEW.trial_end_date IS DISTINCT FROM OLD.trial_end_date THEN
    -- Silently revert subscription fields instead of raising an exception
    NEW.is_premium := OLD.is_premium;
    NEW.subscription_plan := OLD.subscription_plan;
    NEW.subscription_status := OLD.subscription_status;
    NEW.trial_end_date := OLD.trial_end_date;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER no_subscription_self_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_subscription_self_update();
