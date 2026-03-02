
-- Add subscription_status column to profiles
ALTER TABLE public.profiles 
ADD COLUMN subscription_status text NOT NULL DEFAULT 'free';

-- Add check constraint for valid values
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_subscription_status_check 
CHECK (subscription_status IN ('free', 'premium'));
