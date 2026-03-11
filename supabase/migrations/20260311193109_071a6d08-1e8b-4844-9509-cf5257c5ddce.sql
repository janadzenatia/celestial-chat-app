
-- Drop all existing RESTRICTIVE policies and recreate as PERMISSIVE

-- chat_messages
DROP POLICY IF EXISTS "Users can delete own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can view own messages" ON public.chat_messages;

CREATE POLICY "Users can delete own messages" ON public.chat_messages FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own messages" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own messages" ON public.chat_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- child_reports
DROP POLICY IF EXISTS "Users can delete own child reports" ON public.child_reports;
DROP POLICY IF EXISTS "Users can insert own child reports" ON public.child_reports;
DROP POLICY IF EXISTS "Users can view own child reports" ON public.child_reports;

CREATE POLICY "Users can delete own child reports" ON public.child_reports FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own child reports" ON public.child_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own child reports" ON public.child_reports FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- children
DROP POLICY IF EXISTS "Users can delete own children" ON public.children;
DROP POLICY IF EXISTS "Users can insert own children" ON public.children;
DROP POLICY IF EXISTS "Users can update own children" ON public.children;
DROP POLICY IF EXISTS "Users can view own children" ON public.children;

CREATE POLICY "Users can delete own children" ON public.children FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own children" ON public.children FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own children" ON public.children FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view own children" ON public.children FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- cosmic_calendars
DROP POLICY IF EXISTS "Users can delete own calendars" ON public.cosmic_calendars;
DROP POLICY IF EXISTS "Users can insert own calendars" ON public.cosmic_calendars;
DROP POLICY IF EXISTS "Users can view own calendars" ON public.cosmic_calendars;

CREATE POLICY "Users can delete own calendars" ON public.cosmic_calendars FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own calendars" ON public.cosmic_calendars FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own calendars" ON public.cosmic_calendars FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- cosmic_matches
DROP POLICY IF EXISTS "Users can delete own matches" ON public.cosmic_matches;
DROP POLICY IF EXISTS "Users can insert own matches" ON public.cosmic_matches;
DROP POLICY IF EXISTS "Users can view own matches" ON public.cosmic_matches;

CREATE POLICY "Users can delete own matches" ON public.cosmic_matches FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own matches" ON public.cosmic_matches FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own matches" ON public.cosmic_matches FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- daily_insights
DROP POLICY IF EXISTS "Users can delete own insights" ON public.daily_insights;
DROP POLICY IF EXISTS "Users can insert own insights" ON public.daily_insights;
DROP POLICY IF EXISTS "Users can view own insights" ON public.daily_insights;

CREATE POLICY "Users can delete own insights" ON public.daily_insights FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own insights" ON public.daily_insights FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own insights" ON public.daily_insights FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- relationship_forecasts
DROP POLICY IF EXISTS "Users can delete own forecasts" ON public.relationship_forecasts;
DROP POLICY IF EXISTS "Users can insert own forecasts" ON public.relationship_forecasts;
DROP POLICY IF EXISTS "Users can view own forecasts" ON public.relationship_forecasts;

CREATE POLICY "Users can delete own forecasts" ON public.relationship_forecasts FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own forecasts" ON public.relationship_forecasts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own forecasts" ON public.relationship_forecasts FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- synastry_reports
DROP POLICY IF EXISTS "Users can delete own synastry" ON public.synastry_reports;
DROP POLICY IF EXISTS "Users can insert own synastry" ON public.synastry_reports;
DROP POLICY IF EXISTS "Users can view own synastry" ON public.synastry_reports;

CREATE POLICY "Users can delete own synastry" ON public.synastry_reports FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own synastry" ON public.synastry_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own synastry" ON public.synastry_reports FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- wealth_reports
DROP POLICY IF EXISTS "Users can delete own wealth reports" ON public.wealth_reports;
DROP POLICY IF EXISTS "Users can insert own wealth reports" ON public.wealth_reports;
DROP POLICY IF EXISTS "Users can view own wealth reports" ON public.wealth_reports;

CREATE POLICY "Users can delete own wealth reports" ON public.wealth_reports FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wealth reports" ON public.wealth_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own wealth reports" ON public.wealth_reports FOR SELECT TO authenticated USING (auth.uid() = user_id);
