import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSunSign, getApproxMoonSign, getApproxRisingSign } from "@/lib/zodiac";

export interface CalendarDay {
  day: number;
  color: "green" | "red" | "neutral";
  advice: string;
}

export function useCosmicCalendar() {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  useEffect(() => {
    if (!user || !profile?.date_of_birth) return;
    loadCalendar();
  }, [user?.id, profile?.date_of_birth, language]);

  const loadCalendar = async () => {
    if (!user) return;
    setLoading(true);

    const { data: cached } = await supabase
      .from("cosmic_calendars")
      .select("days")
      .eq("user_id", user.id)
      .eq("month", month)
      .eq("year", year)
      .eq("language", language)
      .maybeSingle();

    if (cached?.days) {
      setDays(cached.days as unknown as CalendarDay[]);
    }
    setLoading(false);
  };

  const generate = async () => {
    if (!user || !profile?.date_of_birth) return;
    setGenerating(true);

    const dob = profile.date_of_birth;
    const tob = profile.time_of_birth;
    const birthLat = (profile as any).birth_lat ?? null;
    const birthLon = (profile as any).birth_lon ?? null;
    const sunSign = getSunSign(dob);
    const moonSign = getApproxMoonSign(dob, tob, birthLat, birthLon);
    const risingSign = getApproxRisingSign(dob, tob, birthLat, birthLon);

    try {
      await supabase
        .from("cosmic_calendars")
        .delete()
        .eq("user_id", user.id)
        .eq("month", month)
        .eq("year", year)
        .eq("language", language);

      const resp = await supabase.functions.invoke("cosmic-calendar", {
        body: {
          dateOfBirth: dob,
          timeOfBirth: tob,
          placeOfBirth: profile.place_of_birth,
          sunSign: sunSign?.name,
          moonSign: moonSign?.name,
          risingSign: risingSign?.name,
          month,
          year,
          language,
        },
      });

      if (resp.error) throw resp.error;
      const calendarDays = (resp.data as { days: CalendarDay[] })?.days || [];
      setDays(calendarDays);

      await supabase.from("cosmic_calendars").insert({
        user_id: user.id,
        month,
        year,
        language,
        days: calendarDays as any,
      });
    } catch (e) {
      console.error("Failed to generate cosmic calendar:", e);
    } finally {
      setGenerating(false);
    }
  };

  return { days, loading, generating, generate, month, year };
}
