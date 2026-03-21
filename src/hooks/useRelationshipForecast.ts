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
  intro?: string;
  periods: ForecastPeriod[];
}

export function useRelationshipForecast(partnerDate?: Date, relationshipDate?: Date, partnerName?: string, partnerTime?: string) {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const [forecast, setForecast] = useState<RelationshipForecast | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const partnerDobStr = partnerDate ? format(partnerDate, "yyyy-MM-dd") : null;
  const relDateStr = relationshipDate ? format(relationshipDate, "yyyy-MM-dd") : null;

  // Load cached forecast
  useEffect(() => {
    if (!user || !partnerDobStr) {
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
        const periods = data.periods as unknown;
        // Handle both old format (array) and new format (object with intro + periods)
        if (Array.isArray(periods)) {
          setForecast({ periods: periods as ForecastPeriod[] });
        } else if (periods && typeof periods === "object" && "periods" in (periods as any)) {
          setForecast(periods as RelationshipForecast);
        } else {
          setForecast(null);
        }
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

    const dob = profile.date_of_birth;
    const tob = profile.time_of_birth;
    const userSunSign = getSunSign(dob);
    const userMoonSign = getApproxMoonSign(dob);
    const userRisingSign = getApproxRisingSign(dob, tob);
    const partnerSunSign = getSunSign(partnerDobStr);
    const partnerMoonSign = getApproxMoonSign(partnerDobStr);
    const partnerRisingSign = getApproxRisingSign(partnerDobStr, partnerTime || null);

    try {
      const resp = await supabase.functions.invoke("relationship-forecast", {
        body: {
          userName: profile.name,
          userDob: dob,
          userSunSign: userSunSign?.name,
          userMoonSign: userMoonSign?.name,
          userRisingSign: userRisingSign?.name,
          partnerName: partnerName || "",
          partnerDob: partnerDobStr,
          partnerSunSign: partnerSunSign?.name,
          partnerMoonSign: partnerMoonSign?.name,
          partnerRisingSign: partnerRisingSign?.name,
          relationshipDate: relDateStr,
          language,
        },
      });

      if (resp.error) throw resp.error;
      const result = resp.data as RelationshipForecast;

      if (result?.periods) {
        // Delete old AFTER successful generation
        await supabase
          .from("relationship_forecasts")
          .delete()
          .eq("user_id", user.id)
          .eq("partner_dob", partnerDobStr)
          .eq("relationship_date", relDateStr)
          .eq("language", language);

        setForecast(result);
        await supabase.from("relationship_forecasts").insert({
          user_id: user.id,
          partner_dob: partnerDobStr,
          relationship_date: relDateStr,
          language,
          periods: result as any,
        });
      }
    } catch (e) {
      console.error("Failed to generate relationship forecast:", e);
      throw e;
    } finally {
      setGenerating(false);
    }
  }, [user?.id, profile, partnerDobStr, relDateStr, partnerName, partnerTime, language]);

  return { forecast, loading, generating, generate };
}
