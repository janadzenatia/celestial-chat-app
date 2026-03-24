import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSunSign, getApproxMoonSign, getApproxRisingSign } from "@/lib/zodiac";

export interface CosmicMatch {
  compatible_signs: string[];
  birth_years: number[];
  personality_profile: string;
}

export function useCosmicMatch() {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const [match, setMatch] = useState<CosmicMatch | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Load cached match
  useEffect(() => {
    if (!user) {
      setMatch(null);
      return;
    }

    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("cosmic_matches")
        .select("compatible_signs, birth_years, personality_profile")
        .eq("user_id", user.id)
        .eq("language", language)
        .maybeSingle();

      if (data) {
        setMatch({
          compatible_signs: data.compatible_signs as string[],
          birth_years: data.birth_years as number[],
          personality_profile: data.personality_profile,
        });
      } else {
        setMatch(null);
      }
      setLoading(false);
    };

    load();
  }, [user?.id, language]);

  const generate = useCallback(async () => {
    if (!user || !profile?.date_of_birth) return;
    setGenerating(true);

    const dob = profile.date_of_birth!;
    const tob = profile.time_of_birth;
    const birthLat = (profile as any).birth_lat ?? null;
    const birthLon = (profile as any).birth_lon ?? null;
    const sunSign = getSunSign(dob);
    const moonSign = getApproxMoonSign(dob, tob);
    const risingSign = getApproxRisingSign(dob, tob, birthLat, birthLon);

    try {
      const resp = await supabase.functions.invoke("cosmic-match", {
        body: {
          name: profile.name,
          dateOfBirth: dob,
          timeOfBirth: tob,
          placeOfBirth: profile.place_of_birth,
          sunSign: sunSign?.name,
          moonSign: moonSign?.name,
          risingSign: risingSign?.name,
          language,
        },
      });

      if (resp.error) throw resp.error;
      const result = resp.data as CosmicMatch;

      if (result?.compatible_signs) {
        // Delete old AFTER successful generation
        await supabase
          .from("cosmic_matches")
          .delete()
          .eq("user_id", user.id)
          .eq("language", language);

        setMatch(result);
        await supabase.from("cosmic_matches").insert({
          user_id: user.id,
          language,
          compatible_signs: result.compatible_signs,
          birth_years: result.birth_years,
          personality_profile: result.personality_profile,
        });
      }
    } catch (e) {
      console.error("Failed to generate cosmic match:", e);
      throw e;
    } finally {
      setGenerating(false);
    }
  }, [user?.id, profile, language]);

  return { match, loading, generating, generate };
}
