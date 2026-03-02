import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSunSign, getApproxMoonSign, getApproxRisingSign } from "@/lib/zodiac";
import { format } from "date-fns";

export interface ForecastPeriod {
  month: string;
  title: string;
  type: "positive" | "challenge" | "neutral";
  description: string;
}

export interface RelationshipForecast {
  periods: ForecastPeriod[];
}

export function useRelationshipForecast(partnerDate?: Date, relationshipDate?: Date) {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const [forecast, setForecast] = useState<RelationshipForecast | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const partnerDobStr = partnerDate ? format(partnerDate, "yyyy-MM-dd") : null;
  const relDateStr = relationshipDate ? format(relationshipDate, "yyyy-MM-dd") : null;

  // Load cached forecast
  useEffect(() => {
    if (!user || !partnerDobStr || !relDateStr) {
      setForecast(null);
      return;
    }

    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("relationship_forecasts")
        .select("periods")
        .eq("user_id", user.id)
        .eq("partner_dob", partnerDobStr)
        .eq("relationship_date", relDateStr)
        .eq("language", language)
        .maybeSingle();

      if (data) {
        setForecast({ periods: data.periods as unknown as ForecastPeriod[] });
      } else {
        setForecast(null);
      }
      setLoading(false);
    };

    load();
  }, [user?.id, partnerDobStr, relDateStr, language]);

  const generate = useCallback(async () => {
    if (!user || !profile?.date_of_birth || !partnerDobStr || !relDateStr) return;
    setGenerating(true);

    // Delete old cached result
    await supabase
      .from("relationship_forecasts")
      .delete()
      .eq("user_id", user.id)
      .eq("partner_dob", partnerDobStr)
      .eq("relationship_date", relDateStr)
      .eq("language", language);

    const dob = profile.date_of_birth;
    const tob = profile.time_of_birth;
    const userSunSign = getSunSign(dob);
    const userMoonSign = getApproxMoonSign(dob);
    const userRisingSign = getApproxRisingSign(dob, tob);
    const partnerSunSign = getSunSign(partnerDobStr);

    try {
      const resp = await supabase.functions.invoke("relationship-forecast", {
        body: {
          userDob: dob,
          userSunSign: userSunSign?.name,
          userMoonSign: userMoonSign?.name,
          userRisingSign: userRisingSign?.name,
          partnerDob: partnerDobStr,
          partnerSunSign: partnerSunSign?.name,
          relationshipDate: relDateStr,
          language,
        },
      });

      if (resp.error) throw resp.error;
      const result = resp.data as RelationshipForecast;

      if (result?.periods) {
        setForecast(result);
        await supabase.from("relationship_forecasts").insert({
          user_id: user.id,
          partner_dob: partnerDobStr,
          relationship_date: relDateStr,
          language,
          periods: result.periods as any,
        });
      }
    } catch (e) {
      console.error("Failed to generate relationship forecast:", e);
    } finally {
      setGenerating(false);
    }
  }, [user?.id, profile, partnerDobStr, relDateStr, language]);

  return { forecast, loading, generating, generate };
}
