import { useState } from "react";
import { format } from "date-fns";
import { Heart, Sparkles, Star, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { getSunSign } from "@/lib/zodiac";
import { calculateCompatibility } from "@/lib/compatibility";
import AppHeader from "@/components/AppHeader";
import { BirthDatePicker } from "@/components/BirthDatePicker";

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
  const { profile } = useAuth();
  const [partnerDate, setPartnerDate] = useState<Date>();

  const userSign = profile?.date_of_birth ? getSunSign(profile.date_of_birth) : null;
  const partnerSign = partnerDate ? getSunSign(format(partnerDate, "yyyy-MM-dd")) : null;
  const result = userSign && partnerSign ? calculateCompatibility(userSign, partnerSign) : null;

  return (
    <div className="flex flex-col">
      <AppHeader />
      <div className="flex-1 px-4 py-6 space-y-6">
        {/* Title */}
        <div className="text-center space-y-1">
          <h1 className="font-serif text-2xl text-gradient-gold">{t("compat.title")}</h1>
          {userSign && (
            <p className="text-sm text-muted-foreground">
              {userSign.emoji} {t(`zodiac.${userSign.name}`)} · {userSign.element}
            </p>
          )}
        </div>

        {/* Date Picker Card */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <label className="text-sm font-medium text-foreground">{t("compat.partnerDob")}</label>
          <BirthDatePicker
            value={partnerDate}
            onChange={setPartnerDate}
            placeholder={t("compat.pickDate")}
          />
        </div>

        {/* Results */}
        {result && partnerSign && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Score Card */}
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

              {/* Score Bar */}
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="h-full gradient-gold rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${result.score}%` }}
                />
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
            </div>

            {/* Strengths */}
            <div className="glass rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold" />
                <h3 className="font-serif text-sm text-gradient-gold">{t("compat.strengths")}</h3>
              </div>
              <ul className="space-y-2">
                {result.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Star className="w-3 h-3 mt-1 text-gold shrink-0" />
                    {s}
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
                {result.challenges.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="w-3 h-3 mt-1 shrink-0 text-center text-xs text-purple-light">•</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompatibilityPage;
