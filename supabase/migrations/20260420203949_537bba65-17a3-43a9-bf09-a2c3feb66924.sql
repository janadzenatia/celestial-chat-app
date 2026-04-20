-- FCM push notification fields on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS fcm_token text,
  ADD COLUMN IF NOT EXISTS fcm_platform text,
  ADD COLUMN IF NOT EXISTS fcm_token_updated_at timestamptz,
  ADD COLUMN IF NOT EXISTS notifications_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS timezone text;

-- Index for the cron job that scans eligible recipients
CREATE INDEX IF NOT EXISTS profiles_push_eligible_idx
  ON public.profiles (notifications_enabled, fcm_token)
  WHERE notifications_enabled = true AND fcm_token IS NOT NULL;

-- Track which users were already pushed today (idempotency for the hourly cron)
CREATE TABLE IF NOT EXISTS public.push_send_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  send_date date NOT NULL DEFAULT CURRENT_DATE,
  kind text NOT NULL,
  fcm_message_id text,
  status text NOT NULL,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, send_date, kind)
);

ALTER TABLE public.push_send_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages push log"
  ON public.push_send_log
  FOR ALL
  USING (auth.role() = 'service_role'::text)
  WITH CHECK (auth.role() = 'service_role'::text);

-- Allow the prevent_subscription_self_update trigger to keep working;
-- the new columns are NOT subscription fields, so no change needed there.
