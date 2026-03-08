import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface HookData {
  hook: string;
  subject: string;
  subjectDob: string | null;
}

const HOOK_STORAGE_KEY = "cosmic_hook_cache";

export const useCosmicHook = () => {
  const { profile, user } = useAuth();
  const { language } = useLanguage();
  const [hookData, setHookData] = useState<HookData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user || !profile?.date_of_birth) return;

    const today = new Date().toISOString().split("T")[0];
    const cached = localStorage.getItem(HOOK_STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.date === today && parsed.language === language && parsed.userId === user.id) {
          setHookData(parsed.data);
          return;
        }
      } catch { /* ignore */ }
    }

    generateHook();
  }, [user?.id, profile?.date_of_birth, language]);

  const generateHook = async () => {
    if (!user || !profile?.date_of_birth) return;
    setLoading(true);

    try {
      const familyMembers: { name: string; dateOfBirth: string; relationship: string }[] = [];

      // Fetch children from database
      const { data: children } = await supabase
        .from("children")
        .select("name, date_of_birth")
        .eq("user_id", user.id);

      children?.forEach((c) =>
        familyMembers.push({ name: c.name, dateOfBirth: c.date_of_birth, relationship: "child" })
      );

      // Include partner from profile data
      if (profile.partner_name && profile.partner_birth_date) {
        familyMembers.push({
          name: profile.partner_name,
          dateOfBirth: profile.partner_birth_date,
          relationship: "partner",
        });
      }

      const resp = await supabase.functions.invoke("cosmic-hook", {
        body: {
          userName: profile.name,
          dateOfBirth: profile.date_of_birth,
          timeOfBirth: profile.time_of_birth,
          familyMembers,
          language,
        },
      });

      if (resp.error) throw resp.error;
      const data = resp.data as HookData;
      setHookData(data);

      const today = new Date().toISOString().split("T")[0];
      localStorage.setItem(
        HOOK_STORAGE_KEY,
        JSON.stringify({ date: today, language, userId: user.id, data })
      );
    } catch (e) {
      console.error("Failed to generate cosmic hook:", e);
    } finally {
      setLoading(false);
    }
  };

  return { hookData, loading, dismissed, dismiss: () => setDismissed(true), refresh: generateHook };
};
