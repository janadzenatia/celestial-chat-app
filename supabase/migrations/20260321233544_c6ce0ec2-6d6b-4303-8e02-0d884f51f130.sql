CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, subscription_plan, trial_end_date)
  VALUES (NEW.id, 'premium', now() + interval '3 days');
  RETURN NEW;
END;
$function$;