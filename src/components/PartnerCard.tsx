import { useState, useEffect } from "react";
import { Heart, Pencil, Trash2, Sparkles, Loader2, Lock, Plus, Star, Flame, MessageCircle, Target, ChevronDown, ChevronUp, MapPin, AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, getEffectivePlan } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { geocodePlace } from "@/lib/geocoding";
import { getSunSign, ZodiacSign } from "@/lib/zodiac";
import ChineseZodiacBadge from "@/components/ChineseZodiacBadge";
import { format, parse } from "date-fns";
import { BirthDatePicker } from "@/components/BirthDatePicker";
import { BirthTimePicker } from "@/components/BirthTimePicker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import PaywallModal from "@/components/PaywallModal";
import { SynastryReport, SynastryCategory } from "@/hooks/useSynastryReport";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface PartnerCardProps {
  onPartnerChange: () => void;
  onDeepSynastry: (partnerName: string, partnerDob: string) => void;
  synastryReport?: SynastryReport | null;
  synastryGenerating?: boolean;
  showDeepReport?: boolean;
  onPaywallSuccess?: () => void;
}

const synastryCategories = [
  { key: "emotional" as const, icon: Heart, emoji: "❤️", translationKey: "synastry.emotional", gradient: "from-pink-500/20 to-rose-500/20", border: "border-pink-500/30", scoreColor: "text-pink-400" },
  { key: "romantic" as const, icon: Flame, emoji: "🔥", translationKey: "synastry.romantic", gradient: "from-orange-500/20 to-red-500/20", border: "border-orange-500/30", scoreColor: "text-orange-400" },
  { key: "communication" as const, icon: MessageCircle, emoji: "💬", translationKey: "synastry.communication", gradient: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30", scoreColor: "text-blue-400" },
  { key: "goals" as const, icon: Target, emoji: "💰", translationKey: "synastry.goals", gradient: "from-green-500/20 to-emerald-500/20", border: "border-green-500/30", scoreColor: "text-green-400" },
];

const PartnerCard = ({ onPartnerChange, onDeepSynastry, synastryReport, synastryGenerating, showDeepReport, onPaywallSuccess }: PartnerCardProps) => {
  const { t, language } = useLanguage();
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [dob, setDob] = useState<Date | undefined>();
  const [location, setLocation] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [generatingLove, setGeneratingLove] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "checking" | "found" | "not_found">("idle");
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lon: number; displayName: string } | null>(null);

  const partnerName = profile?.partner_name as string | undefined;
  const partnerDob = profile?.partner_birth_date as string | undefined;
  const partnerLoveLanguage = profile?.partner_love_language as string | undefined;

  const partnerSign = partnerDob ? getSunSign(partnerDob) : null;

  // Debounced geocoding for birth place
  useEffect(() => {
    if (!location.trim() || location.trim().length < 2) {
      setGeoStatus("idle");
      setGeoCoords(null);
      return;
    }
    setGeoStatus("checking");
    const timer = setTimeout(async () => {
      const result = await geocodePlace(location.trim());
      if (result) {
        setGeoStatus("found");
        setGeoCoords(result);
      } else {
        setGeoStatus("not_found");
        setGeoCoords(null);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [location]);

  const openAddForm = async () => {
    setName("");
    setDob(undefined);
    setLocation("");
    setBirthTime("");
    setGeoStatus("idle");
    setGeoCoords(null);
    setEditMode(false);
    // Auto-populate from family partner if exists
    if (user) {
      const { data } = await supabase
        .from("children")
        .select("name, date_of_birth, time_of_birth, birth_place")
        .eq("user_id", user.id)
        .eq("relationship_type", "partner")
        .limit(1)
        .single();
      if (data) {
        setName(data.name);
        setDob(parse(data.date_of_birth, "yyyy-MM-dd", new Date()));
        setBirthTime(data.time_of_birth || "");
        setLocation(data.birth_place || "");
      }
    }
    setFormOpen(true);
  };

  const openEditForm = () => {
    setName(partnerName || "");
    setDob(partnerDob ? parse(partnerDob, "yyyy-MM-dd", new Date()) : undefined);
    setLocation(profile?.partner_place_of_birth || "");
    setBirthTime(profile?.partner_time_of_birth || "");
    setGeoStatus("idle");
    setGeoCoords(null);
    setEditMode(true);
    setFormOpen(true);
  };

  const generateLoveLanguage = async (pName: string, sign: ZodiacSign) => {
    if (!user || !profile) return;
    setGeneratingLove(true);

    const partnerDob = profile.partner_birth_date;
    const partnerTob = profile.partner_time_of_birth;
    const partnerLat = (profile as any).partner_birth_place_lat ?? null;
    const partnerLon = (profile as any).partner_birth_place_lon ?? null;
    const partnerMoon = partnerDob ? getApproxMoonSign(partnerDob, partnerTob) : null;
    const partnerRising = partnerDob ? getApproxRisingSign(partnerDob, partnerTob, partnerLat, partnerLon) : null;

    const userBirthLat = (profile as any).birth_lat ?? null;
    const userBirthLon = (profile as any).birth_lon ?? null;
    const userSun = profile.date_of_birth ? getSunSign(profile.date_of_birth) : null;
    const userMoon = profile.date_of_birth ? getApproxMoonSign(profile.date_of_birth, profile.time_of_birth) : null;
    const userRising = profile.date_of_birth ? getApproxRisingSign(profile.date_of_birth, profile.time_of_birth, userBirthLat, userBirthLon) : null;

    try {
      const resp = await supabase.functions.invoke("partner-love-language", {
        body: {
          partnerName: pName,
          partnerSign: sign.name,
          partnerElement: sign.element,
          partnerMoonSign: partnerMoon?.name,
          partnerRisingSign: partnerRising?.name,
          userSunSign: userSun?.name,
          userMoonSign: userMoon?.name,
          userRisingSign: userRising?.name,
          language,
        },
      });
      if (resp.error) throw resp.error;
      const summary = resp.data?.summary || "";
      await supabase
        .from("profiles")
        .update({ partner_love_language: summary } as any)
        .eq("user_id", user.id);
      await refreshProfile();
    } catch (e) {
      console.error("Love language generation failed:", e);
    } finally {
      setGeneratingLove(false);
    }
  };

  const handleSave = async () => {
    if (!user || !name.trim() || !dob) return;
    setSaving(true);
    const dobStr = format(dob, "yyyy-MM-dd");
    const sign = getSunSign(dobStr);

    // Use geocoded coordinates if available, otherwise try geocoding now
    let partnerGeo = geoCoords;
    if (!partnerGeo && location.trim()) {
      partnerGeo = await geocodePlace(location.trim());
    }

    const updateData: any = {
      partner_name: name.trim(),
      partner_birth_date: dobStr,
      partner_love_language: null,
      partner_place_of_birth: location.trim() || null,
      partner_time_of_birth: birthTime.trim() || null,
      partner_birth_place_lat: partnerGeo?.lat ?? null,
      partner_birth_place_lon: partnerGeo?.lon ?? null,
      partner_birth_place_normalized: partnerGeo?.displayName ?? null,
      relationship_start_date: null,
    };

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("user_id", user.id);

    if (error) {
      toast({ title: t("auth.genericError"), variant: "destructive" });
    } else {
      // Sync to family partner card
      const { data: familyPartner } = await supabase
        .from("children")
        .select("id")
        .eq("user_id", user.id)
        .eq("relationship_type", "partner")
        .limit(1)
        .maybeSingle();

      if (familyPartner) {
        await supabase
          .from("children")
          .update({
            name: name.trim(),
            date_of_birth: dobStr,
            time_of_birth: birthTime.trim() || null,
            birth_place: location.trim() || null,
            birth_place_lat: partnerGeo?.lat ?? null,
            birth_place_lon: partnerGeo?.lon ?? null,
          })
          .eq("id", familyPartner.id);
      }

      await refreshProfile();
      setFormOpen(false);
      onPartnerChange();
      if (sign) {
        generateLoveLanguage(name.trim(), sign);
      }
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!user) return;
    await supabase
      .from("profiles")
      .update({
        partner_name: null,
        partner_birth_date: null,
        partner_love_language: null,
        partner_time_of_birth: null,
        partner_place_of_birth: null,
        relationship_start_date: null,
      } as any)
      .eq("user_id", user.id);
    await refreshProfile();
    onPartnerChange();
  };

  const isPremium = getEffectivePlan(profile) !== "free";

  const handleDeepSynastry = () => {
    if (!isPremium) {
      setPaywallOpen(true);
      return;
    }
    if (partnerName && partnerDob) {
      onDeepSynastry(partnerName, partnerDob);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  // Empty state
  if (!partnerName || !partnerDob) {
    return (
      <>
        <button
          onClick={openAddForm}
          className="w-full glass rounded-2xl p-8 border border-dashed border-primary/30 flex flex-col items-center gap-3 hover:border-primary/60 transition-colors cursor-pointer"
        >
          <div className="w-14 h-14 rounded-full gradient-gold flex items-center justify-center">
            <Plus className="w-7 h-7 text-primary-foreground" />
          </div>
          <span className="font-serif text-lg text-gradient-gold">{t("partner.add")}</span>
          <span className="text-xs text-muted-foreground">{t("partner.addDesc")}</span>
        </button>

        <PartnerFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          name={name}
          setName={setName}
          dob={dob}
          setDob={setDob}
          location={location}
          setLocation={setLocation}
          birthTime={birthTime}
          setBirthTime={setBirthTime}
          saving={saving}
          onSave={handleSave}
          editMode={editMode}
          geoStatus={geoStatus}
          geoCoords={geoCoords}
        />
      </>
    );
  }

  // Populated state
  return (
    <>
      <div className="glass rounded-2xl overflow-hidden">
        {/* Partner header */}
        <div className="gradient-cosmic p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-3xl">
            {partnerSign?.emoji || "💫"}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-lg text-foreground truncate">{partnerName}</h3>
            {partnerSign && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">
                  {t(`zodiac.${partnerSign.name}`)} · {t(`element.${partnerSign.element}`)}
                </span>
                {partnerDob && <ChineseZodiacBadge dateOfBirth={partnerDob} />}
              </div>
            )}
          </div>
          <div className="flex gap-1.5">
            <button onClick={openEditForm} className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <Pencil className="w-4 h-4 text-muted-foreground" />
            </button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass border-primary/20">
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("partner.deleteTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>{t("partner.deleteDesc")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("family.cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                    {t("partner.deleteConfirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Love language section - FREE for all */}
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-400" />
            <h4 className="text-sm font-semibold text-foreground">{t("partner.loveLanguage")}</h4>
          </div>
          {generatingLove ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("partner.generatingLove")}
            </div>
          ) : partnerLoveLanguage ? (
            <p className="text-sm text-muted-foreground leading-relaxed">{partnerLoveLanguage}</p>
          ) : (
            <p className="text-xs text-muted-foreground italic">{t("partner.noLoveLanguage")}</p>
          )}
        </div>

        {/* Synastry Accordion — only after deep report is generated */}
        {showDeepReport && synastryReport && (
          <div className="px-5 pb-4 space-y-2">
            {/* Overall score */}
            <div className="text-center py-3">
              <div className="text-4xl font-serif font-bold text-gradient-gold">{synastryReport.overall_score}%</div>
              <p className="text-xs text-muted-foreground mt-1">{t("synastry.overallScore")}</p>
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden mt-2">
                <div className="h-full gradient-gold rounded-full transition-all duration-1000 ease-out" style={{ width: `${synastryReport.overall_score}%` }} />
              </div>
            </div>

            {synastryCategories.map(({ key, icon: Icon, emoji, translationKey, gradient, border, scoreColor }) => {
              const cat = synastryReport[key] as SynastryCategory;
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
                      <span className="text-sm font-medium text-foreground">{t(translationKey)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-bold tabular-nums", scoreColor)}>{cat.score}%</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-3 pb-3 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="w-full bg-muted rounded-full h-1 overflow-hidden mb-2">
                        <div className={cn("h-full rounded-full bg-gradient-to-r", gradient)} style={{ width: `${cat.score}%` }} />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{cat.analysis}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Deep Synastry CTA — hidden once report is rendered */}
        {!(showDeepReport && synastryReport) && (
          <div className="px-5 pb-5">
            <button
              onClick={handleDeepSynastry}
              disabled={synastryGenerating}
              className={cn(
                "w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-opacity",
                isPremium
                  ? "gradient-gold text-primary-foreground hover:opacity-90"
                  : "bg-muted/50 border border-primary/20 text-foreground hover:bg-muted"
              )}
            >
              {synastryGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("synastry.generating")}
                </>
              ) : isPremium ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  {t("partner.deepSynastry")}
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-primary" />
                  {t("partner.deepSynastry")}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <PartnerFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        name={name}
        setName={setName}
        dob={dob}
        setDob={setDob}
        location={location}
        setLocation={setLocation}
        birthTime={birthTime}
        setBirthTime={setBirthTime}
        saving={saving}
        onSave={handleSave}
        editMode={editMode}
        geoStatus={geoStatus}
        geoCoords={geoCoords}
      />
      <PaywallModal open={paywallOpen} onOpenChange={setPaywallOpen} onSuccess={onPaywallSuccess} />
    </>
  );
};

// --- Sub-component: Form Dialog ---
interface PartnerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  setName: (n: string) => void;
  dob: Date | undefined;
  setDob: (d: Date | undefined) => void;
  location: string;
  setLocation: (l: string) => void;
  birthTime: string;
  setBirthTime: (t: string) => void;
  saving: boolean;
  onSave: () => void;
  editMode: boolean;
  geoStatus: "idle" | "checking" | "found" | "not_found";
  geoCoords: { lat: number; lon: number; displayName: string } | null;
}

const PartnerFormDialog = ({
  open, onOpenChange, name, setName, dob, setDob,
  location, setLocation, birthTime, setBirthTime,
  saving, onSave, editMode, geoStatus, geoCoords,
}: PartnerFormDialogProps) => {
  const { t, language } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-primary/20 max-w-sm rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-gradient-gold">
            {editMode ? t("partner.edit") : t("partner.add")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("compat.partnerName")}</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("compat.partnerNamePlaceholder")}
              className="glass border-white/10 focus:border-primary"
            />
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("compat.partnerDob")}</label>
            <BirthDatePicker value={dob} onChange={setDob} placeholder={t("compat.pickDate")} />
          </div>

          {/* Birth Time */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("partner.birthTime")}</label>
            <BirthTimePicker value={birthTime} onChange={setBirthTime} />
          </div>

          {/* Place of Birth with geocoding verification */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("partner.placeOfBirth")}</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t("partner.placeOfBirthPlaceholder")}
              className="glass border-white/10 focus:border-primary"
            />
            {geoStatus === "checking" && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>{language === "ka" ? "მდებარეობის ძებნა..." : "Searching location..."}</span>
              </div>
            )}
            {geoStatus === "found" && geoCoords && (
              <div className="flex items-center gap-1.5 text-xs text-green-400">
                <MapPin className="w-3 h-3" />
                <span>{geoCoords.displayName} ({geoCoords.lat.toFixed(2)}°, {geoCoords.lon.toFixed(2)}°)</span>
              </div>
            )}
            {geoStatus === "not_found" && (
              <div className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="w-3 h-3" />
                <span>{t("profile.cityNotFound")}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              {t("family.cancel")}
            </Button>
            <Button
              className="flex-1 gradient-gold text-primary-foreground"
              disabled={!name.trim() || !dob || saving}
              onClick={onSave}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t("family.save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PartnerCard;
