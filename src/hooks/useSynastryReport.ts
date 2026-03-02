import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSunSign, getApproxMoonSign, getApproxRisingSign } from "@/lib/zodiac";
import { format } from "date-fns";

export interface SynastryCategory {
  score: number;
  analysis: string;
}

export interface SynastryReport {
  overall_score: number;
  emotional: SynastryCategory;
  romantic: SynastryCategory;
  communication: SynastryCategory;
  goals: SynastryCategory;
}

export function useSynastryReport(partnerDob?: string, partnerName?: string, partnerTime?: string) {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const [report, setReport] = useState<SynastryReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Load cached report
  useEffect(() => {
    if (!user || !partnerDob) {
      setReport(null);
      return;
    }

    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("synastry_reports")
        .select("overall_score, emotional, romantic, communication, goals")
        .eq("user_id", user.id)
        .eq("partner_dob", partnerDob)
        .eq("language", language)
        .maybeSingle();

      if (data) {
        setReport({
          overall_score: data.overall_score,
          emotional: data.emotional as unknown as SynastryCategory,
          romantic: data.romantic as unknown as SynastryCategory,
          communication: data.communication as unknown as SynastryCategory,
          goals: data.goals as unknown as SynastryCategory,
        });
      } else {
        setReport(null);
      }
      setLoading(false);
    };

    load();
  }, [user?.id, partnerDob, language]);

  const generate = useCallback(async () => {
    if (!user || !profile?.date_of_birth || !partnerDob) return;
    setGenerating(true);

    // Delete old cached result
    await supabase
      .from("synastry_reports")
      .delete()
      .eq("user_id", user.id)
      .eq("partner_dob", partnerDob)
      .eq("language", language);

    const dob = profile.date_of_birth;
    const tob = profile.time_of_birth;
    const userSunSign = getSunSign(dob);
    const userMoonSign = getApproxMoonSign(dob);
    const userRisingSign = getApproxRisingSign(dob, tob);

    const partnerSunSign = getSunSign(partnerDob);
    const partnerMoonSign = getApproxMoonSign(partnerDob);
    const partnerRisingSign = getApproxRisingSign(partnerDob, partnerTime || null);

    try {
      const resp = await supabase.functions.invoke("synastry-report", {
        body: {
          userName: profile.name,
          userDob: dob,
          userSunSign: userSunSign?.name,
          userMoonSign: userMoonSign?.name,
          userRisingSign: userRisingSign?.name,
          partnerName: partnerName || "",
          partnerDob,
          partnerSunSign: partnerSunSign?.name,
          partnerMoonSign: partnerMoonSign?.name,
          partnerRisingSign: partnerRisingSign?.name,
          language,
        },
      });

      if (resp.error) throw resp.error;
      const result = resp.data as SynastryReport;

      if (result?.overall_score !== undefined) {
        setReport(result);
        await supabase.from("synastry_reports").insert({
          user_id: user.id,
          partner_name: partnerName || "",
          partner_dob: partnerDob,
          partner_time: partnerTime || null,
          language,
          overall_score: result.overall_score,
          emotional: result.emotional as any,
          romantic: result.romantic as any,
          communication: result.communication as any,
          goals: result.goals as any,
        });
      }
    } catch (e) {
      console.error("Failed to generate synastry report:", e);
    } finally {
      setGenerating(false);
    }
  }, [user?.id, profile, partnerDob, partnerName, partnerTime, language]);

  return { report, loading, generating, generate };
}
