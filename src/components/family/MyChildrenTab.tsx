import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, Trash2, Sparkles, ChevronDown, ChevronUp, Star, Heart, BookOpen } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getSunSign, getApproxMoonSign, getApproxRisingSign } from "@/lib/zodiac";
import { BirthDatePicker } from "@/components/BirthDatePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Child {
  id: string;
  name: string;
  date_of_birth: string;
  time_of_birth: string | null;
}

interface ChildReport {
  blueprint: string;
  emotional_connection: string;
  parenting_advice: string;
}

export default function MyChildrenTab() {
  const { t } = useLanguage();
  const { language } = useLanguage();
  const { user, profile } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [childName, setChildName] = useState("");
  const [childDate, setChildDate] = useState<Date | undefined>();
  const [childTime, setChildTime] = useState("");
  const [saving, setSaving] = useState(false);

  // Reports state keyed by child id
  const [reports, setReports] = useState<Record<string, ChildReport>>({});
  const [generating, setGenerating] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, string | null>>({});

  const loadChildren = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("children")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    setChildren((data as Child[]) || []);

    // Load reports
    if (data && data.length > 0) {
      const { data: reps } = await supabase
        .from("child_reports")
        .select("child_id, blueprint, emotional_connection, parenting_advice")
        .eq("user_id", user.id)
        .eq("language", language)
        .in("child_id", data.map((c: Child) => c.id));
      const repMap: Record<string, ChildReport> = {};
      (reps || []).forEach((r: any) => {
        repMap[r.child_id] = { blueprint: r.blueprint, emotional_connection: r.emotional_connection, parenting_advice: r.parenting_advice };
      });
      setReports(repMap);
    }
    setLoading(false);
  }, [user?.id, language]);

  useEffect(() => { loadChildren(); }, [loadChildren]);

  const addChild = async () => {
    if (!user || !childName.trim() || !childDate) return;
    setSaving(true);
    const dob = childDate.toISOString().split("T")[0];
    const { error } = await supabase.from("children").insert({
      user_id: user.id,
      name: childName.trim(),
      date_of_birth: dob,
      time_of_birth: childTime.trim() || null,
    });
    if (!error) {
      setChildName(""); setChildDate(undefined); setChildTime(""); setShowForm(false);
      await loadChildren();
    }
    setSaving(false);
  };

  const deleteChild = async (id: string) => {
    await supabase.from("children").delete().eq("id", id);
    setChildren(prev => prev.filter(c => c.id !== id));
    setReports(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  const generateReport = async (child: Child) => {
    if (!user || !profile?.date_of_birth) return;
    setGenerating(child.id);
    try {
      await supabase.from("child_reports").delete().eq("child_id", child.id).eq("language", language);

      const parentSun = getSunSign(profile.date_of_birth);
      const parentMoon = getApproxMoonSign(profile.date_of_birth);
      const parentRising = getApproxRisingSign(profile.date_of_birth, profile.time_of_birth);
      const childSun = getSunSign(child.date_of_birth);
      const childMoon = getApproxMoonSign(child.date_of_birth);
      const childRising = getApproxRisingSign(child.date_of_birth, child.time_of_birth);

      const resp = await supabase.functions.invoke("child-synastry", {
        body: {
          parentName: profile.name,
          parentDob: profile.date_of_birth,
          parentSunSign: parentSun?.name,
          parentMoonSign: parentMoon?.name,
          parentRisingSign: parentRising?.name,
          childName: child.name,
          childDob: child.date_of_birth,
          childSunSign: childSun?.name,
          childMoonSign: childMoon?.name,
          childRisingSign: childRising?.name,
          childHasTime: Boolean(child.time_of_birth),
          language,
        },
      });

      if (resp.error) throw resp.error;
      const result = resp.data as ChildReport;
      setReports(prev => ({ ...prev, [child.id]: result }));
      setExpanded(prev => ({ ...prev, [child.id]: "blueprint" }));

      await supabase.from("child_reports").insert({
        user_id: user.id,
        child_id: child.id,
        language,
        blueprint: result.blueprint,
        emotional_connection: result.emotional_connection,
        parenting_advice: result.parenting_advice,
      });
    } catch (e) {
      console.error("child-synastry error:", e);
    } finally {
      setGenerating(null);
    }
  };

  const toggleSection = (childId: string, section: string) => {
    setExpanded(prev => ({
      ...prev,
      [childId]: prev[childId] === section ? null : section,
    }));
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6 flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">{t("family.loading")}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Child Cards */}
      {children.map(child => {
        const sun = getSunSign(child.date_of_birth);
        const report = reports[child.id];
        const isGenerating = generating === child.id;
        const expandedSection = expanded[child.id] || null;

        return (
          <div key={child.id} className="glass rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{sun?.emoji || "⭐"}</span>
                <div>
                  <h3 className="font-serif text-base text-foreground">{child.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {sun ? `${t(`zodiac.${sun.name}`)} · ${t(`element.${sun.element}`)}` : child.date_of_birth}
                  </p>
                </div>
              </div>
              <button onClick={() => deleteChild(child.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Report or Generate */}
            {report ? (
              <div className="space-y-2">
                {[
                  { key: "blueprint", icon: Star, label: t("family.blueprint"), content: report.blueprint },
                  { key: "emotional", icon: Heart, label: t("family.emotionalBond"), content: report.emotional_connection },
                  { key: "advice", icon: BookOpen, label: t("family.parentingAdvice"), content: report.parenting_advice },
                ].map(({ key, icon: Icon, label, content }) => (
                  <div key={key} className="rounded-xl border border-white/10 overflow-hidden">
                    <button
                      onClick={() => toggleSection(child.id, key)}
                      className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">{label}</span>
                      </div>
                      {expandedSection === key ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </button>
                    {expandedSection === key && (
                      <div className="px-3 pb-3 animate-in fade-in slide-in-from-top-1 duration-200">
                        <p className="text-sm text-muted-foreground leading-relaxed">{content}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <Button
                onClick={() => generateReport(child)}
                disabled={isGenerating}
                className="w-full gradient-cosmic text-foreground font-medium"
              >
                {isGenerating ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("family.analyzingChild")}</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" />{t("family.analyzeChild")}</>
                )}
              </Button>
            )}
          </div>
        );
      })}

      {/* Add Child Form */}
      {showForm ? (
        <div className="glass rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h3 className="font-serif text-base text-gradient-gold">{t("family.addChild")}</h3>
          <div className="space-y-3">
            <Input
              value={childName}
              onChange={e => setChildName(e.target.value)}
              placeholder={t("family.childNamePlaceholder")}
              className="glass border-white/10 focus:border-primary"
            />
            <BirthDatePicker
              value={childDate}
              onChange={setChildDate}
              placeholder={t("compat.pickDate")}
            />
            <Input
              value={childTime}
              onChange={e => setChildTime(e.target.value.replace(/[^\d:]/g, "").slice(0, 5))}
              placeholder={t("compat.partnerTimePlaceholder")}
              className="glass border-white/10 focus:border-primary"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={addChild}
              disabled={saving || !childName.trim() || !childDate}
              className="flex-1 gradient-cosmic text-foreground font-medium"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t("family.save")}
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)} className="text-muted-foreground">
              {t("family.cancel")}
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full glass rounded-2xl p-5 flex items-center justify-center gap-2 text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors border border-dashed border-white/20"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">{t("family.addChild")}</span>
        </button>
      )}
    </div>
  );
}
