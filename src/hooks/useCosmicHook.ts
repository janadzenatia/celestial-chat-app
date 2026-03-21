import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface HookData {
  hook: string;
  subject: string;
  subjectDob: string | null;
}

export const useCosmicHook = () => {
  const { profile, user } = useAuth();
  const { language } = useLanguage();
  const [hookData, setHookData] = useState<HookData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user || !profile?.date_of_birth) return;
    checkCacheAndGenerate();
  }, [user?.id, profile?.date_of_birth, language]);

  const checkCacheAndGenerate = async () => {
    if (!user || !profile?.date_of_birth) return;

    const today = new Date().toISOString().split("T")[0];

    // Check DB cache first
    const { data: cached } = await (supabase as any)
      .from("cosmic_hooks")
      .select("hook, subject, subject_dob")
      .eq("user_id", user.id)
      .eq("hook_date", today)
      .eq("language", language)
      .maybeSingle();

    if (cached) {
      setHookData({
        hook: cached.hook,
        subject: cached.subject,
        subjectDob: cached.subject_dob,
      });
      return;
    }

    await generateHook();
  };

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

      // Build rotation list: user → partner → children
      const rotationList: { name: string; dateOfBirth: string; relationship: string }[] = [
        { name: profile.name || "self", dateOfBirth: profile.date_of_birth!, relationship: "self" },
      ];

      const partner = familyMembers.find((m) => m.relationship === "partner");
      if (partner) rotationList.push(partner);

      const childMembers = familyMembers.filter((m) => m.relationship === "child");
      childMembers.forEach((c) => rotationList.push(c));

      // Determine today's index using epoch day count
      const epochDays = Math.floor(Date.now() / 86400000);
      const todayIndex = epochDays % rotationList.length;
      const todaySubject = rotationList[todayIndex];

      const resp = await supabase.functions.invoke("cosmic-hook", {
        body: {
          userName: profile.name,
          dateOfBirth: profile.date_of_birth,
          timeOfBirth: profile.time_of_birth,
          familyMembers,
          language,
          todaySubject,
        },
      });

      if (resp.error) throw resp.error;
      const data = resp.data as HookData;
      setHookData(data);

      // Cache in DB
      const today = new Date().toISOString().split("T")[0];
      await (supabase as any).from("cosmic_hooks").insert({
        user_id: user.id,
        hook_date: today,
        language,
        hook: data.hook,
        subject: data.subject,
        subject_dob: data.subjectDob,
      });
    } catch (e) {
      console.error("Failed to generate cosmic hook:", e);
    } finally {
      setLoading(false);
    }
  };

  return { hookData, loading, dismissed, dismiss: () => setDismissed(true), refresh: generateHook };
};
