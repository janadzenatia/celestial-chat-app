import { useState, useEffect, useCallback } from "react";
import { Sparkles, Loader2, ChevronDown, ChevronUp, Star, Compass, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface BlueprintCategory {
  title: string;
  content: string;
}

interface BlueprintReport {
  core_personality: BlueprintCategory;
  karmic_path: BlueprintCategory;
  hidden_strengths: BlueprintCategory;
}

const blueprintSections = [
  { key: "core_personality" as const, icon: Star, emoji: "✨", gradient: "from-purple-500/20 to-pink-500/20", border: "border-purple-500/30", color: "text-purple-400" },
  { key: "karmic_path" as const, icon: Compass, emoji: "🧭", gradient: "from-amber-500/20 to-orange-500/20", border: "border-amber-500/30", color: "text-amber-400" },
  { key: "hidden_strengths" as const, icon: Zap, emoji: "⚡", gradient: "from-cyan-500/20 to-blue-500/20", border: "border-cyan-500/30", color: "text-cyan-400" },
];

const CosmicBlueprintCard = () => {
  const { t, language } = useLanguage();
  const { user, profile } = useAuth();
  const [report, setReport] = useState<BlueprintReport | null>(null);
  const [generating, setGenerating] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Load cached report from localStorage
  useEffect(() => {
    if (!user) return;
    const cached = localStorage.getItem(`blueprint_${user.id}_${language}`);
    if (cached) {
      try { setReport(JSON.parse(cached)); } catch { /* ignore */ }
    }
  }, [user?.id, language]);

  const generate = useCallback(async () => {
    if (!user || !profile?.date_of_birth) return;
    setGenerating(true);
    try {
      const resp = await supabase.functions.invoke("cosmic-blueprint", {
        body: {
          name: profile.name || "",
          dob: profile.date_of_birth,
          tob: profile.time_of_birth || null,
          pob: profile.place_of_birth || null,
          language,
        },
      });
      if (resp.error) throw resp.error;
      const data = resp.data as BlueprintReport;
      if (data?.core_personality) {
        setReport(data);
        localStorage.setItem(`blueprint_${user.id}_${language}`, JSON.stringify(data));
      }
    } catch (e) {
      console.error("Blueprint generation failed:", e);
    } finally {
      setGenerating(false);
    }
  }, [user?.id, profile, language]);

  const toggleSection = (key: string) => {
    setExpandedSection(prev => prev === key ? null : key);
  };

  if (!profile?.date_of_birth) return null;

  return (
    <section className="glass rounded-2xl overflow-hidden">
      <div className="p-5">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-serif text-xl text-gradient-gold">{t("blueprint.title")}</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">{t("blueprint.description")}</p>

        {generating ? (
          <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground text-sm">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{t("blueprint.generating")}</span>
          </div>
        ) : report ? (
          <div className="space-y-2">
            {blueprintSections.map(({ key, emoji, gradient, border, color }) => {
              const cat = report[key];
              if (!cat) return null;
              const isExpanded = expandedSection === key;
              return (
                <div key={key} className={cn("rounded-xl border overflow-hidden", border)}>
                  <button
                    onClick={() => toggleSection(key)}
                    className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br shrink-0", gradient)}>
                        <span className="text-sm">{emoji}</span>
                      </div>
                      <span className="text-sm font-medium text-foreground">{cat.title}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  {isExpanded && (
                    <div className="px-3 pb-3 animate-in fade-in slide-in-from-top-1 duration-200">
                      <p className="text-sm text-muted-foreground leading-relaxed">{cat.content}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <button
            onClick={generate}
            className="w-full gradient-gold text-primary-foreground font-semibold text-sm px-5 py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {t("blueprint.generate")}
          </button>
        )}
      </div>
    </section>
  );
};

export default CosmicBlueprintCard;
