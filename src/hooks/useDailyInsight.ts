import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSunSign, getApproxMoonSign, getApproxRisingSign } from "@/lib/zodiac";

export function useDailyInsight() {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const generate = useCallback(async (skipCache: boolean) => {
    if (!user || !profile?.date_of_birth) {
      setLoading(false);
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    setLoading(true);

    if (skipCache) {
      await supabase
        .from("daily_insights")
        .delete()
        .eq("user_id", user.id)
        .eq("insight_date", today)
        .eq("language", language);
    } else {
      const { data: cached } = await supabase
        .from("daily_insights")
        .select("content")
        .eq("user_id", user.id)
        .eq("insight_date", today)
        .eq("language", language)
        .maybeSingle();

      if (cached?.content) {
        setInsight(cached.content);
        setLoading(false);
        return;
      }
    }

    const dob = profile.date_of_birth!;
    const tob = profile.time_of_birth;
    const sunSign = getSunSign(dob);
    const moonSign = getApproxMoonSign(dob);
    const risingSign = getApproxRisingSign(dob, tob);

    try {
      const resp = await supabase.functions.invoke("daily-insight", {
        body: {
          name: profile.name,
          sunSign: sunSign?.name,
          moonSign: moonSign?.name,
          risingSign: risingSign?.name,
          language,
        },
      });

      if (resp.error) throw resp.error;
      const content = resp.data?.content;

      if (content) {
        setInsight(content);
        await supabase.from("daily_insights").insert({
          user_id: user.id,
          insight_date: today,
          language,
          content,
        });
      }
    } catch (e) {
      console.error("Failed to generate daily insight:", e);
    } finally {
      setLoading(false);
    }
  }, [user?.id, profile, language]);

  useEffect(() => {
    generate(refreshKey > 0);
  }, [user?.id, profile?.date_of_birth, language, refreshKey]);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  return { insight, loading, refresh };
}
