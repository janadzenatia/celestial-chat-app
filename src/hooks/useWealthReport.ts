import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCachedBig3 } from "@/lib/getCachedBig3";

interface WealthReport {
  cosmic_calling: string;
  wealth_dna: string;
  career_timeline: string;
}

export function useWealthReport() {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const [report, setReport] = useState<WealthReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Load cached report
  useEffect(() => {
    if (!user) { setFetching(false); return; }
    (async () => {
      const { data } = await supabase
        .from("wealth_reports")
        .select("*")
        .eq("user_id", user.id)
        .eq("language", language)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        setReport({
          cosmic_calling: data.cosmic_calling,
          wealth_dna: data.wealth_dna,
          career_timeline: data.career_timeline,
        });
      } else {
        setReport(null);
      }
      setFetching(false);
    })();
  }, [user, language]);

  const generate = async () => {
    if (!user || !profile?.date_of_birth) return;
    setLoading(true);

    const dob = profile.date_of_birth;
    const tob = profile.time_of_birth;
    const { sunSign, moonSign, risingSign } = getCachedBig3(profile);

    try {
      const { data, error } = await supabase.functions.invoke("wealth-career", {
        body: {
          dateOfBirth: dob,
          timeOfBirth: tob,
          placeOfBirth: profile.place_of_birth,
          name: profile.name,
          sunSign: sunSign?.name,
          moonSign: moonSign?.name,
          risingSign: risingSign?.name,
          language,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const newReport: WealthReport = {
        cosmic_calling: data.cosmic_calling,
        wealth_dna: data.wealth_dna,
        career_timeline: data.career_timeline,
      };
      setReport(newReport);

      await supabase.from("wealth_reports").insert({
        user_id: user.id,
        language,
        cosmic_calling: newReport.cosmic_calling,
        wealth_dna: newReport.wealth_dna,
        career_timeline: newReport.career_timeline,
      });
    } catch (e) {
      console.error("Wealth report error:", e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { report, loading, fetching, generate };
}
