import AppHeader from "@/components/AppHeader";
import CosmicMatchCard from "@/components/CosmicMatchCard";
import WealthCareerCard from "@/components/WealthCareerCard";
import CosmicHookBanner from "@/components/CosmicHookBanner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Sun, Moon, Sunrise, Loader2, RefreshCw } from "lucide-react";
import { getSunSign, getApproxMoonSign, getApproxRisingSign } from "@/lib/zodiac";
import { useDailyInsight } from "@/hooks/useDailyInsight";

const Index = () => {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const { insight, loading: insightLoading, refresh: refreshInsight } = useDailyInsight();

  const dob = profile?.date_of_birth ?? null;
  const tob = profile?.time_of_birth ?? null;

  const sunSign = dob ? getSunSign(dob) : null;
  const moonSign = dob ? getApproxMoonSign(dob) : null;
  const risingSign = dob ? getApproxRisingSign(dob, tob) : null;

  const big3 = [
    { label: t("dashboard.sun"), icon: Sun, sign: sunSign ? t(`zodiac.${sunSign.name}`) : "—", emoji: sunSign?.emoji ?? "☀️" },
    { label: t("dashboard.moon"), icon: Moon, sign: moonSign ? t(`zodiac.${moonSign.name}`) : "—", emoji: moonSign?.emoji ?? "🌙" },
    { label: t("dashboard.rising"), icon: Sunrise, sign: risingSign ? t(`zodiac.${risingSign.name}`) : "—", emoji: risingSign?.emoji ?? "🌅" },
  ];

  return (
    <div className="flex flex-col">
      <AppHeader />

      <div className="px-4 py-6 space-y-5">
        {/* Cosmic Hook Notification */}
        {dob && <CosmicHookBanner />}

        {/* Greeting */}
        {profile?.name && (
          <p className="text-muted-foreground text-sm">
            ✨ {t("dashboard.greeting")}, <span className="text-foreground font-medium">{profile.name}</span>
          </p>
        )}

        {/* Big 3 Card */}
        <section className="glass rounded-2xl p-5 shadow-gold">
          <h2 className="font-serif text-xl text-gradient-gold mb-4">{t("dashboard.big3")}</h2>
          <div className="grid grid-cols-3 gap-3">
            {big3.map(({ label, icon: Icon, sign, emoji }) => (
              <div key={label} className="flex flex-col items-center gap-2 glass rounded-xl p-3">
                <Icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                <span className="text-2xl">{emoji}</span>
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-sm font-semibold text-foreground">{sign}</span>
              </div>
            ))}
          </div>
          {!tob && dob && (
            <p className="text-xs text-muted-foreground mt-3 text-center opacity-70">
              ℹ️ Moon & Rising are approximate. Add your birth time in Profile for better accuracy.
            </p>
          )}
        </section>

        {/* Daily Insight */}
        <section className="glass rounded-2xl p-5 shadow-purple">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-xl text-gradient-gold">{t("dashboard.daily")}</h2>
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
              <span>Reading the stars...</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed">
              ✨ {insight || "Add your birth date to receive personalized insights."}
            </p>
          )}
        </section>
        {/* Cosmic Match */}
        {dob && <CosmicMatchCard />}

        {/* Wealth & Career Destiny */}
        {dob && <WealthCareerCard />}
      </div>
    </div>
  );
};

export default Index;
