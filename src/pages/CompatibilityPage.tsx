import { useState, useEffect } from "react";
import { format, parse } from "date-fns";
import { Heart, Sparkles, Star, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { getSunSign } from "@/lib/zodiac";
import { calculateCompatibility } from "@/lib/compatibility";
import AppHeader from "@/components/AppHeader";
import RelationshipForecastCard from "@/components/RelationshipForecast";
import BirthTimeModal from "@/components/BirthTimeModal";
import PremiumGate from "@/components/PremiumGate";
import PartnerCard from "@/components/PartnerCard";
import { useRelationshipForecast } from "@/hooks/useRelationshipForecast";
import { useSynastryReport } from "@/hooks/useSynastryReport";

const levelColors = {
  soulmate: "text-pink-400",
  great: "text-green-400",
  good: "text-blue-400",
  challenging: "text-orange-400",
};

const levelGradients = {
  soulmate: "from-pink-500/20 to-purple-500/20",
  great: "from-green-500/20 to-teal-500/20",
  good: "from-blue-500/20 to-cyan-500/20",
  challenging: "from-orange-500/20 to-red-500/20",
};

const CompatibilityPage = () => {
  const { t } = useLanguage();
  const { profile, user, refreshProfile } = useAuth();

  const partnerName = profile?.partner_name || "";
  const partnerDobStr = profile?.partner_birth_date || undefined;
  const partnerTimeStr = profile?.partner_time_of_birth || undefined;
  const relationshipDateStr = profile?.relationship_start_date || undefined;

  const [timeModalOpen, setTimeModalOpen] = useState(false);
  const [showDeepReport, setShowDeepReport] = useState(false);
  const [partnerTime, setPartnerTime] = useState("");

  useEffect(() => {
    setPartnerTime(partnerTimeStr || "");
  }, [partnerTimeStr]);

  // Auto-show deep report if cached report exists
  useEffect(() => {
    if (report && !showDeepReport) {
      setShowDeepReport(true);
    }
  }, [report]);

  const relationshipDate = relationshipDateStr
    ? parse(relationshipDateStr, "yyyy-MM-dd", new Date())
    : undefined;

  const userSign = profile?.date_of_birth ? getSunSign(profile.date_of_birth) : null;
  const partnerSign = partnerDobStr ? getSunSign(partnerDobStr) : null;
  const result = userSign && partnerSign ? calculateCompatibility(userSign, partnerSign) : null;

  const partnerDate = partnerDobStr ? parse(partnerDobStr, "yyyy-MM-dd", new Date()) : undefined;
  const partnerHasTime = Boolean(partnerTime && partnerTime.trim().length >= 4);

  const { report, loading: reportLoading, generating: reportGenerating, generate: generateReport } = useSynastryReport(partnerDobStr, partnerName, partnerTime || undefined, relationshipDateStr);
  const { forecast, loading: forecastLoading, generating: forecastGenerating, generate: generateForecast } = useRelationshipForecast(partnerDate, relationshipDate, partnerName, partnerTime || undefined);

  // Deep report is "active" when synastry accordion is visible
  const deepReportReady = showDeepReport && report;

  const handleDeepSynastry = (_pName: string, _pDob: string) => {
    setShowDeepReport(true);
    // Always prompt for time + relationship date before generating
    setTimeModalOpen(true);
  };

  const handlePaywallSuccess = () => {
    // After successful premium upgrade, open the data-entry modal
    setShowDeepReport(true);
    setTimeModalOpen(true);
  };

  const saveExtraFields = async (time?: string, relDate?: Date) => {
    if (!user) return;
    const updateData: any = {};
    if (time && time.trim().length >= 4) {
      updateData.partner_time_of_birth = time.trim();
      setPartnerTime(time.trim());
    }
    if (relDate) {
      updateData.relationship_start_date = format(relDate, "yyyy-MM-dd");
    }
    if (Object.keys(updateData).length > 0) {
      await supabase.from("profiles").update(updateData).eq("user_id", user.id);
      await refreshProfile();
    }
  };

  const handleTimeSubmit = async (time: string, relDate?: Date) => {
    await saveExtraFields(time, relDate);
    setTimeModalOpen(false);
    setTimeout(() => generateReport(), 100);
  };


  return (
    <div className="flex flex-col">
      <AppHeader />
      <div className="flex-1 px-4 py-6 space-y-6">
        {/* Title */}
        <div className="text-center space-y-1">
          <h1 className="font-serif text-2xl text-gradient-gold">{t("compat.title")}</h1>
          {userSign && (
            <p className="text-sm text-muted-foreground">
              {userSign.emoji} {t(`zodiac.${userSign.name}`)} · {t(`element.${userSign.element}`)}
            </p>
          )}
        </div>

        {/* 1. Partner Card — always visible */}
        <PartnerCard
          onPartnerChange={() => setShowDeepReport(false)}
          onDeepSynastry={handleDeepSynastry}
          synastryReport={report}
          synastryGenerating={reportGenerating}
          showDeepReport={showDeepReport}
          onPaywallSuccess={handlePaywallSuccess}
        />

        {/* 2. Basic Compatibility — HIDDEN once deep report is ready */}
        {result && partnerSign && !deepReportReady && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className={cn("glass rounded-2xl p-6 text-center space-y-4 bg-gradient-to-br", levelGradients[result.level])}>
              <div className="flex items-center justify-center gap-4">
                <span className="text-4xl">{userSign!.emoji}</span>
                <Heart className="w-6 h-6 text-pink-400 animate-pulse" />
                <span className="text-4xl">{partnerSign.emoji}</span>
              </div>
              <div>
                <div className="text-5xl font-serif font-bold text-gradient-gold">{result.score}%</div>
                <p className={cn("text-sm font-semibold mt-1", levelColors[result.level])}>
                  {t(`compat.${result.level}`)}
                </p>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="h-full gradient-gold rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${result.score}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {userSign!.emoji} {t(`zodiac.${userSign!.name}`)} & {partnerSign.emoji} {t(`zodiac.${partnerSign.name}`)} — {t(`compat.summary.${result.level}`)}
              </p>
            </div>

            {/* Strengths */}
            <div className="glass rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold" />
                <h3 className="font-serif text-sm text-gradient-gold">{t("compat.strengths")}</h3>
              </div>
              <ul className="space-y-2">
                {result.strengthKeys.map((key, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Star className="w-3 h-3 mt-1 text-gold shrink-0" />
                    {t(key)}
                  </li>
                ))}
              </ul>
            </div>

            {/* Challenges */}
            <div className="glass rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-light" />
                <h3 className="font-serif text-sm text-gradient-gold">{t("compat.challenges")}</h3>
              </div>
              <ul className="space-y-2">
                {result.challengeKeys.map((key, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="w-3 h-3 mt-1 shrink-0 text-center text-xs text-purple-light">•</span>
                    {t(key)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 3. Warning text + Yellow CTA — HIDDEN once deep report is ready */}
        {partnerDobStr && !deepReportReady && (
          <div className="space-y-4">
            {/* Warning text */}
            <p className="text-sm text-muted-foreground leading-relaxed text-center px-2">
              {t("synastry.cta.message")}
            </p>
          </div>
        )}

        {/* Relationship Forecast — ONLY shown after deep synastry + premium */}
        {partnerDobStr && showDeepReport && (
          <PremiumGate overlay>
            <RelationshipForecastCard
              intro={forecast?.intro}
              periods={forecast?.periods ?? null}
              loading={forecastLoading}
              generating={forecastGenerating}
              onGenerate={generateForecast}
              onRegenerate={generateForecast}
              relationshipDate={relationshipDate}
              onRelationshipDateChange={() => {}}
            />
          </PremiumGate>
        )}
      </div>

      {/* Birth Time Modal */}
      <BirthTimeModal
        open={timeModalOpen}
        onOpenChange={setTimeModalOpen}
        partnerName={partnerName}
        generating={reportGenerating}
        onSubmitWithTime={(time, relDate) => {
          handleTimeSubmit(time, relDate);
        }}
        onSkip={() => {}}
      />
    </div>
  );
};

export default CompatibilityPage;
