import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import CosmicMatchCard from "@/components/CosmicMatchCard";
import WealthCareerCard from "@/components/WealthCareerCard";
import CosmicHookBanner from "@/components/CosmicHookBanner";
import SynastryCTABanner from "@/components/SynastryCTABanner";
import CosmicCalendarCard from "@/components/CosmicCalendarCard";
import CosmicBlueprintCard from "@/components/CosmicBlueprintCard";
import PremiumGate from "@/components/PremiumGate";
import TrialBanner from "@/components/TrialBanner";
import Big3DetailSheet from "@/components/Big3DetailSheet";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Sun, Moon, Sunrise, Loader2, RefreshCw } from "lucide-react";
import { getSunSign, getApproxMoonSign, getApproxRisingSign } from "@/lib/zodiac";
import { useDailyInsight } from "@/hooks/useDailyInsight";

const Index = () => {
  const { t, language } = useLanguage();
  const { profile } = useAuth();
  const { insight, loading: insightLoading, refresh: refreshInsight, period } = useDailyInsight();
  const [selectedBig3, setSelectedBig3] = useState<"sun" | "moon" | "rising" | null>(null);

  const dob = profile?.date_of_birth ?? null;
  const tob = profile?.time_of_birth ?? null;

  const sunSign = dob ? getSunSign(dob) : null;
  const moonSign = dob ? getApproxMoonSign(dob) : null;
  const risingSign = dob ? getApproxRisingSign(dob, tob) : null;

  const big3 = [
    { key: "sun" as const, label: t("dashboard.sun"), icon: Sun, sign: sunSign ? t(`zodiac.${sunSign.name}`) : "—", emoji: sunSign?.emoji ?? "☀️" },
    { key: "moon" as const, label: t("dashboard.moon"), icon: Moon, sign: moonSign ? t(`zodiac.${moonSign.name}`) : "—", emoji: moonSign?.emoji ?? "🌙" },
    { key: "rising" as const, label: t("dashboard.rising"), icon: Sunrise, sign: risingSign ? t(`zodiac.${risingSign.name}`) : "—", emoji: risingSign?.emoji ?? "🌅" },
  ];

  const selectedSign = selectedBig3 === "sun" ? sunSign : selectedBig3 === "moon" ? moonSign : risingSign;
  const selectedSignName = selectedSign ? t(`zodiac.${selectedSign.name}`) : "";
  const selectedSignEmoji = selectedSign?.emoji ?? "";

  return (
    <div className="flex flex-col">
      <AppHeader />

      <div className="px-4 py-6 space-y-5">
        {/* Greeting — first thing the user sees */}
        {profile?.name && (
          <p className="text-muted-foreground text-sm">
            ✨ {t("dashboard.greeting")}, <span className="text-foreground font-medium">{profile.name}</span>
          </p>
        )}

        {/* Trial Banner */}
        <TrialBanner />

        {/* Cosmic Hook Notification */}
        {dob && <CosmicHookBanner />}

        {/* Big 3 Card */}
        <section className="glass rounded-2xl p-5 shadow-gold">
          <h2 className="font-serif text-xl text-gradient-gold mb-4">{t("dashboard.big3")}</h2>
          <div className="grid grid-cols-3 gap-3">
            {big3.map(({ key, label, icon: Icon, sign, emoji }) => (
              <button
                key={key}
                onClick={() => dob && setSelectedBig3(key)}
                className="flex flex-col items-center gap-2 glass rounded-xl p-3 cursor-pointer hover:border-primary/30 hover:shadow-gold/20 transition-all active:scale-95 border border-transparent"
              >
                <Icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                <span className="text-2xl">{emoji}</span>
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-sm font-semibold text-foreground">{sign}</span>
              </button>
            ))}
          </div>
          {!tob && dob && (
            <p className="text-xs text-muted-foreground mt-3 text-center opacity-70">
              {t("dashboard.approxNote")}
            </p>
          )}
        </section>

        {/* Daily Insight */}
        <section className="glass rounded-2xl p-5 shadow-purple">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-serif text-xl text-gradient-gold">{t("dashboard.phrase")}</h2>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {period === "morning" ? (language === "ka" ? "☀️ დღის" : "☀️ Morning") : (language === "ka" ? "🌙 საღამოს" : "🌙 Evening")}
              </span>
            </div>
            <button
              onClick={refreshInsight}
              disabled={insightLoading}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
              aria-label="Refresh insight"
            >
              <RefreshCw className={`w-4 h-4 ${insightLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
          {insightLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t("dashboard.readingStars")}</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed">
              ✨ {insight || t("dashboard.noInsight")}
            </p>
          )}
        </section>
        {/* My Cosmic Blueprint — Premium gated */}
        {dob && (
          <PremiumGate overlay>
            <CosmicBlueprintCard />
          </PremiumGate>
        )}

        {/* Cosmic Match — free hook, no premium badge */}
        {dob && <CosmicMatchCard />}

        {/* Synastry CTA — below match results, above deep analysis */}
        {dob && <SynastryCTABanner />}

        {/* Cosmic Traffic Light Calendar */}
        {dob && (
          <PremiumGate overlay>
            <CosmicCalendarCard />
          </PremiumGate>
        )}

        {/* Wealth & Career Destiny */}
        {dob && (
          <PremiumGate overlay>
            <WealthCareerCard />
          </PremiumGate>
        )}
      </div>
    </div>
  );
};

export default Index;
