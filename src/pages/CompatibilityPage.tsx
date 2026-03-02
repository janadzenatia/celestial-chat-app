import { useState, useEffect } from "react";
import { format, parse } from "date-fns";
import { Heart, Sparkles, Star, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { getSunSign } from "@/lib/zodiac";
import { calculateCompatibility } from "@/lib/compatibility";
import AppHeader from "@/components/AppHeader";
import { BirthDatePicker } from "@/components/BirthDatePicker";
import RelationshipForecastCard from "@/components/RelationshipForecast";
import SynastryReportCard from "@/components/SynastryReportCard";
import BirthTimeModal from "@/components/BirthTimeModal";
import PremiumGate from "@/components/PremiumGate";
import { useRelationshipForecast } from "@/hooks/useRelationshipForecast";
import { useSynastryReport } from "@/hooks/useSynastryReport";
import { Input } from "@/components/ui/input";

const STORAGE_KEY = "astrochat_compat_form";

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

function loadSavedForm() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as {
      partnerName: string;
      partnerDate: string | null;
      partnerTime: string;
      relationshipDate: string | null;
    };
  } catch {
    return null;
  }
}

const CompatibilityPage = () => {
  const { t } = useLanguage();
  const { profile } = useAuth();

  const saved = loadSavedForm();

  const [partnerName, setPartnerName] = useState(saved?.partnerName ?? "");
  const [partnerDate, setPartnerDate] = useState<Date | undefined>(
    saved?.partnerDate ? parse(saved.partnerDate, "yyyy-MM-dd", new Date()) : undefined
  );
  const [partnerTime, setPartnerTime] = useState(saved?.partnerTime ?? "");
  const [relationshipDate, setRelationshipDate] = useState<Date | undefined>(
    saved?.relationshipDate ? parse(saved.relationshipDate, "yyyy-MM-dd", new Date()) : undefined
  );
  const [timeModalOpen, setTimeModalOpen] = useState(false);

  // Persist form state
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        partnerName,
        partnerDate: partnerDate ? format(partnerDate, "yyyy-MM-dd") : null,
        partnerTime,
        relationshipDate: relationshipDate ? format(relationshipDate, "yyyy-MM-dd") : null,
      })
    );
  }, [partnerName, partnerDate, partnerTime, relationshipDate]);

  const userSign = profile?.date_of_birth ? getSunSign(profile.date_of_birth) : null;
  const partnerDobStr = partnerDate ? format(partnerDate, "yyyy-MM-dd") : undefined;
  const partnerSign = partnerDobStr ? getSunSign(partnerDobStr) : null;
  const result = userSign && partnerSign ? calculateCompatibility(userSign, partnerSign) : null;

  const partnerHasTime = Boolean(partnerTime && partnerTime.trim().length >= 4);

  const { forecast, loading: forecastLoading, generating: forecastGenerating, generate: generateForecast } = useRelationshipForecast(partnerDate, relationshipDate, partnerName, partnerTime || undefined);
  const { report, loading: reportLoading, generating: reportGenerating, generate: generateReport } = useSynastryReport(partnerDobStr, partnerName, partnerTime || undefined);

  // Intercept synastry generate with birth time modal
  const handleSynastryGenerate = () => {
    if (partnerHasTime) {
      // Already have time, generate directly
      generateReport();
    } else {
      setTimeModalOpen(true);
    }
  };

  const handleTimeSubmit = (time: string) => {
    setPartnerTime(time);
    // Generate will re-trigger with updated time via the hook
    setTimeout(() => generateReport(), 100);
  };

  const handleTimeSkip = () => {
    setTimeModalOpen(false);
    generateReport();
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

        {/* Partner Input Card — only name & DOB */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("compat.partnerName")}</label>
            <Input
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              placeholder={t("compat.partnerNamePlaceholder")}
              className="glass border-white/10 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("compat.partnerDob")}</label>
            <BirthDatePicker
              value={partnerDate}
              onChange={setPartnerDate}
              placeholder={t("compat.pickDate")}
            />
          </div>
        </div>

        {/* Basic Compatibility Results */}
        {result && partnerSign && (
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

        {/* Deep Synastry Report — Premium gated */}
        {partnerDobStr && (
          <PremiumGate overlay>
            <SynastryReportCard
              report={report}
              loading={reportLoading}
              generating={reportGenerating}
              onGenerate={handleSynastryGenerate}
              onRegenerate={generateReport}
              userEmoji={userSign?.emoji}
              partnerEmoji={partnerSign?.emoji}
              partnerName={partnerName}
              partnerHasTime={partnerHasTime}
            />
          </PremiumGate>
        )}

        {/* Relationship Forecast — Premium gated */}
        {partnerDobStr && (
          <PremiumGate overlay>
            <RelationshipForecastCard
              intro={forecast?.intro}
              periods={forecast?.periods ?? null}
              loading={forecastLoading}
              generating={forecastGenerating}
              onGenerate={generateForecast}
              onRegenerate={generateForecast}
              relationshipDate={relationshipDate}
              onRelationshipDateChange={setRelationshipDate}
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
        onSubmitWithTime={(time) => {
          setPartnerTime(time);
          setTimeModalOpen(false);
          handleTimeSubmit(time);
        }}
        onSkip={handleTimeSkip}
      />
    </div>
  );
};

export default CompatibilityPage;
