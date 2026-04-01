import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, Trash2, Sparkles, ChevronDown, ChevronUp, Star, Heart, BookOpen, MapPin, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, getEffectivePlan } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getSunSign, getApproxMoonSign, getApproxRisingSign } from "@/lib/zodiac";
import { geocodePlace } from "@/lib/geocoding";
import ChineseZodiacBadge from "@/components/ChineseZodiacBadge";
import { BirthDatePicker } from "@/components/BirthDatePicker";
import { BirthTimePicker } from "@/components/BirthTimePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PaywallModal from "@/components/PaywallModal";
import PremiumGate from "@/components/PremiumGate";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type RelationshipType = "child" | "partner" | "father" | "mother" | "brother" | "sister" | "grandfather" | "grandmother" | "other";

interface FamilyMember {
  id: string;
  name: string;
  date_of_birth: string;
  time_of_birth: string | null;
  relationship_type: RelationshipType;
  custom_type?: string;
  birth_place?: string | null;
  birth_place_lat?: number | null;
  birth_place_lon?: number | null;
}

interface ChildReport {
  blueprint: string;
  emotional_connection: string;
  parenting_advice: string;
}

const RELATIONSHIP_TYPES: { key: RelationshipType; emoji: string; translationKey: string }[] = [
  { key: "child", emoji: "👶", translationKey: "family.type.child" },
  { key: "partner", emoji: "💑", translationKey: "family.type.partner" },
  { key: "father", emoji: "👨", translationKey: "family.type.father" },
  { key: "mother", emoji: "👩", translationKey: "family.type.mother" },
  { key: "brother", emoji: "👦", translationKey: "family.type.brother" },
  { key: "sister", emoji: "👧", translationKey: "family.type.sister" },
  { key: "grandfather", emoji: "👴", translationKey: "family.type.grandfather" },
  { key: "grandmother", emoji: "👵", translationKey: "family.type.grandmother" },
  { key: "other", emoji: "👤", translationKey: "family.type.other" },
];

interface MyChildrenTabProps {
  onFamilyChanged?: () => void;
}

export default function MyChildrenTab({ onFamilyChanged }: MyChildrenTabProps) {
  const { t, language } = useLanguage();
  const { user, profile } = useAuth();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [formStep, setFormStep] = useState<"closed" | "selectType" | "partnerSync" | "enterData">("closed");
  const [selectedType, setSelectedType] = useState<RelationshipType | null>(null);
  const [customType, setCustomType] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberDate, setMemberDate] = useState<Date | undefined>();
  const [memberTime, setMemberTime] = useState("");
  const [memberPlace, setMemberPlace] = useState("");
  const [saving, setSaving] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);

  // Geocode verification state
  const [geoStatus, setGeoStatus] = useState<"idle" | "checking" | "found" | "not_found">("idle");
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lon: number; displayName: string } | null>(null);

  const isPremium = getEffectivePlan(profile) !== "free";

  const [reports, setReports] = useState<Record<string, ChildReport>>({});
  const [generating, setGenerating] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, string | null>>({});

  // Debounced geocode check
  useEffect(() => {
    if (!memberPlace.trim() || memberPlace.trim().length < 3) {
      setGeoStatus("idle");
      setGeoCoords(null);
      return;
    }
    setGeoStatus("checking");
    const timer = setTimeout(async () => {
      const result = await geocodePlace(memberPlace.trim());
      if (result) {
        setGeoStatus("found");
        setGeoCoords(result);
      } else {
        setGeoStatus("not_found");
        setGeoCoords(null);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [memberPlace]);

  const loadMembers = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("children")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    const mapped = (data || []).map((d: any) => ({
      ...d,
      relationship_type: d.relationship_type || "child",
    })) as FamilyMember[];
    setMembers(mapped);

    if (data && data.length > 0) {
      const { data: reps } = await supabase
        .from("child_reports")
        .select("child_id, blueprint, emotional_connection, parenting_advice")
        .eq("user_id", user.id)
        .eq("language", language)
        .in("child_id", data.map((c: any) => c.id));
      const repMap: Record<string, ChildReport> = {};
      (reps || []).forEach((r: any) => {
        repMap[r.child_id] = { blueprint: r.blueprint, emotional_connection: r.emotional_connection, parenting_advice: r.parenting_advice };
      });
      setReports(repMap);
    }
    setLoading(false);
  }, [user?.id, language]);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  const addMember = async () => {
    if (!user || !memberName.trim() || !memberDate || !selectedType) return;
    if (selectedType === "other" && !customType.trim()) return;
    setSaving(true);
    const dob = memberDate.toISOString().split("T")[0];
    const effectiveType = selectedType === "other" ? `other:${customType.trim()}` : selectedType;

    // Use geocode result if available, or fetch fresh
    let lat: number | null = null;
    let lon: number | null = null;
    let placeText = memberPlace.trim() || null;
    if (geoCoords && geoStatus === "found") {
      lat = geoCoords.lat;
      lon = geoCoords.lon;
    } else if (placeText) {
      const coords = await geocodePlace(placeText);
      if (coords) { lat = coords.lat; lon = coords.lon; }
    }

    const { error } = await supabase.from("children").insert({
      user_id: user.id,
      name: memberName.trim(),
      date_of_birth: dob,
      time_of_birth: memberTime.trim() || null,
      relationship_type: effectiveType,
      birth_place: placeText,
      birth_place_lat: lat,
      birth_place_lon: lon,
    } as any);
    if (!error) {
      resetForm();
      await loadMembers();
      onFamilyChanged?.();
    }
    setSaving(false);
  };

  const addPartnerFromProfile = async () => {
    if (!user || !profile?.partner_name || !profile?.partner_birth_date) return;
    setSaving(true);
    const { error } = await supabase.from("children").insert({
      user_id: user.id,
      name: profile.partner_name,
      date_of_birth: profile.partner_birth_date,
      time_of_birth: profile.partner_time_of_birth || null,
      relationship_type: "partner",
      birth_place: profile.partner_place_of_birth || null,
    } as any);
    if (!error) {
      resetForm();
      await loadMembers();
      onFamilyChanged?.();
    }
    setSaving(false);
  };

  const handleTypeSelect = (key: RelationshipType) => {
    setSelectedType(key);
    if (key === "partner") {
      const existingPartner = members.find(m => m.relationship_type === "partner");
      if (existingPartner) {
        toast.info(t("partner.alreadyExists"));
        setSelectedType(null);
        return;
      }
      if (profile?.partner_name && profile?.partner_birth_date) {
        setFormStep("partnerSync");
        return;
      }
    }
    if (key === "other") return;
    setFormStep("enterData");
  };

  const resetForm = () => {
    setMemberName("");
    setMemberDate(undefined);
    setMemberTime("");
    setMemberPlace("");
    setSelectedType(null);
    setCustomType("");
    setFormStep("closed");
    setGeoStatus("idle");
    setGeoCoords(null);
  };

  const deleteMember = async (id: string) => {
    await supabase.from("children").delete().eq("id", id);
    setMembers(prev => prev.filter(c => c.id !== id));
    setReports(prev => { const n = { ...prev }; delete n[id]; return n; });
    onFamilyChanged?.();
  };

  const getMemberBig3 = (member: FamilyMember) => {
    const sun = getSunSign(member.date_of_birth);
    const moon = getApproxMoonSign(member.date_of_birth, member.time_of_birth, member.birth_place_lon);
    const rising = getApproxRisingSign(
      member.date_of_birth,
      member.time_of_birth,
      member.birth_place_lat,
      member.birth_place_lon
    );
    return { sun, moon, rising };
  };

  const generateReport = async (member: FamilyMember) => {
    if (!user || !profile?.date_of_birth) return;
    setGenerating(member.id);
    try {
      await supabase.from("child_reports").delete().eq("child_id", member.id).eq("language", language);

      const parentSun = getSunSign(profile.date_of_birth);
      const parentMoon = getApproxMoonSign(profile.date_of_birth, profile.time_of_birth, profile.birth_lon);
      const parentRising = getApproxRisingSign(profile.date_of_birth, profile.time_of_birth, profile.birth_lat, profile.birth_lon);
      const { sun: memberSun, moon: memberMoon, rising: memberRising } = getMemberBig3(member);

      const resp = await supabase.functions.invoke("child-synastry", {
        body: {
          parentName: profile.name,
          parentDob: profile.date_of_birth,
          parentSunSign: parentSun?.name,
          parentMoonSign: parentMoon?.name,
          parentRisingSign: parentRising?.name,
          childName: member.name,
          childDob: member.date_of_birth,
          childTimeOfBirth: member.time_of_birth || null,
          childBirthPlace: member.birth_place || null,
          childSunSign: memberSun?.name,
          childMoonSign: memberMoon?.name,
          childRisingSign: memberRising?.name,
          childHasTime: Boolean(member.time_of_birth),
          childHasPlace: Boolean(member.birth_place_lat),
          relationshipType: member.relationship_type,
          language,
        },
      });

      if (resp.error) throw resp.error;
      const result = resp.data as ChildReport;
      setReports(prev => ({ ...prev, [member.id]: result }));
      setExpanded(prev => ({ ...prev, [member.id]: "blueprint" }));

      await supabase.from("child_reports").insert({
        user_id: user.id,
        child_id: member.id,
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

  const toggleSection = (memberId: string, section: string) => {
    setExpanded(prev => ({
      ...prev,
      [memberId]: prev[memberId] === section ? null : section,
    }));
  };

  const getTypeLabel = (type: string) => {
    if (type.startsWith("other:")) return type.slice(6);
    return t(`family.type.${type}`);
  };

  const getTypeEmoji = (type: string) => {
    if (type.startsWith("other:")) return "👤";
    const found = RELATIONSHIP_TYPES.find(r => r.key === type);
    return found?.emoji || "👤";
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
      {/* Family Member Cards */}
      {members.map(member => {
        const { sun, moon, rising } = getMemberBig3(member);
        const report = reports[member.id];
        const isGenerating = generating === member.id;
        const expandedSection = expanded[member.id] || null;

        return (
          <div key={member.id} className="glass rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{sun?.emoji || "⭐"}</span>
                <div>
                  <h3 className="font-serif text-base text-foreground">{member.name}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-primary/15 text-primary">
                      {getTypeEmoji(member.relationship_type)} {getTypeLabel(member.relationship_type)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {sun ? `${t(`zodiac.${sun.name}`)} · ${t(`element.${sun.element}`)}` : member.date_of_birth}
                    </span>
                    <ChineseZodiacBadge dateOfBirth={member.date_of_birth} />
                  </div>
                </div>
              </div>
              <button onClick={() => deleteMember(member.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Big 3 display */}
            <div className="flex gap-2">
              {[
                { label: t("dashboard.sun"), sign: sun },
                { label: t("dashboard.moon"), sign: moon },
                { label: t("dashboard.rising"), sign: rising },
              ].map(({ label, sign }) => (
                <div key={label} className="flex-1 text-center py-1.5 px-1 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-lg">{sign?.emoji || "?"}</span>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{label}</p>
                  <p className="text-[10px] font-medium text-foreground">{sign ? t(`zodiac.${sign.name}`) : "—"}</p>
                </div>
              ))}
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
                      onClick={() => toggleSection(member.id, key)}
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
              <PremiumGate overlay>
                <Button
                  onClick={() => generateReport(member)}
                  disabled={isGenerating}
                  className="w-full gradient-cosmic text-foreground font-medium"
                >
                  {isGenerating ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("family.analyzingChild")}</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2" />{t("family.analyzeChild")}</>
                  )}
                </Button>
              </PremiumGate>
            )}
          </div>
        );
      })}

      {/* Add Member Flow */}
      {formStep === "selectType" && (
        <div className="glass rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h3 className="font-serif text-base text-gradient-gold">{t("family.selectType")}</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {RELATIONSHIP_TYPES.map(({ key, emoji, translationKey }) => (
              <button
                key={key}
                onClick={() => handleTypeSelect(key)}
                className={cn(
                  "flex-shrink-0 flex flex-col items-center gap-1.5 py-3 px-4 rounded-xl border transition-all min-w-[72px]",
                  selectedType === key
                    ? "gradient-cosmic border-primary/30 shadow-lg"
                    : "glass border-transparent hover:bg-primary/10 hover:border-primary/30"
                )}
              >
                <span className="text-2xl">{emoji}</span>
                <span className="text-xs font-medium text-foreground whitespace-nowrap">{t(translationKey)}</span>
              </button>
            ))}
          </div>
          {selectedType === "other" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <Input
                value={customType}
                onChange={e => setCustomType(e.target.value)}
                placeholder={t("family.customTypePlaceholder")}
                className="glass border-white/10 focus:border-primary"
              />
              <Button
                onClick={() => { if (customType.trim()) setFormStep("enterData"); }}
                disabled={!customType.trim()}
                className="w-full gradient-cosmic text-foreground font-medium"
              >
                {t("family.continue") || "Continue"}
              </Button>
            </div>
          )}
          <Button variant="ghost" onClick={resetForm} className="w-full text-muted-foreground">
            {t("family.cancel")}
          </Button>
        </div>
      )}

      {/* Partner Sync Prompt */}
      {formStep === "partnerSync" && profile?.partner_name && (
        <div className="glass rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💑</span>
            <p className="text-sm text-foreground leading-relaxed">
              {t("partner.syncPrompt").replace("{name}", profile.partner_name)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={addPartnerFromProfile}
              disabled={saving}
              className="flex-1 gradient-gold text-primary-foreground font-medium"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t("partner.yesAdd")}
            </Button>
            <Button
              variant="outline"
              onClick={() => setFormStep("enterData")}
              className="flex-1"
            >
              {t("partner.differentPerson")}
            </Button>
          </div>
          <Button variant="ghost" onClick={resetForm} className="w-full text-muted-foreground">
            {t("family.cancel")}
          </Button>
        </div>
      )}

      {formStep === "enterData" && selectedType && (
        <div className="glass rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-2">
            <span className="text-xl">{getTypeEmoji(selectedType)}</span>
            <h3 className="font-serif text-base text-gradient-gold">
              {selectedType === "other" ? customType : t(`family.type.${selectedType}`)}
            </h3>
          </div>
          <div className="space-y-3">
            <Input
              value={memberName}
              onChange={e => setMemberName(e.target.value)}
              placeholder={t("family.memberNamePlaceholder")}
              className="glass border-white/10 focus:border-primary"
            />
            <BirthDatePicker
              value={memberDate}
              onChange={setMemberDate}
              placeholder={t("compat.pickDate")}
            />
            <BirthTimePicker
              value={memberTime}
              onChange={setMemberTime}
            />

            {/* Birth Place with geocoding */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t("family.placeOfBirth")}</Label>
              <Input
                value={memberPlace}
                onChange={e => setMemberPlace(e.target.value)}
                placeholder={t("family.placeOfBirthPlaceholder")}
                className="glass border-white/10 focus:border-primary"
              />
              {geoStatus === "checking" && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" />
                </div>
              )}
              {geoStatus === "found" && geoCoords && (
                <div className="flex items-center gap-1.5 text-xs text-green-400">
                  <MapPin className="w-3 h-3" />
                  <span>{geoCoords.lat.toFixed(2)}°, {geoCoords.lon.toFixed(2)}°</span>
                </div>
              )}
              {geoStatus === "not_found" && (
                <div className="flex items-center gap-1.5 text-xs text-destructive">
                  <AlertCircle className="w-3 h-3" />
                  <span>{t("family.cityNotFound")}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={addMember}
              disabled={saving || !memberName.trim() || !memberDate}
              className="flex-1 gradient-cosmic text-foreground font-medium"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t("family.save")}
            </Button>
            <Button variant="ghost" onClick={resetForm} className="text-muted-foreground">
              {t("family.cancel")}
            </Button>
          </div>
        </div>
      )}

      {formStep === "closed" && (
        <button
          onClick={() => {
            if (!isPremium) { setPaywallOpen(true); return; }
            setFormStep("selectType");
          }}
          className="w-full glass rounded-2xl p-5 flex items-center justify-center gap-2 text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors border border-dashed border-white/20"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">{t("family.addMember")}</span>
        </button>
      )}

      <PaywallModal open={paywallOpen} onOpenChange={setPaywallOpen} />
    </div>
  );
}
