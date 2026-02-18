import AppHeader from "@/components/AppHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sun, Moon, Sunrise } from "lucide-react";

const zodiacSigns = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

const dailyInsights = [
  "The stars align in your favor today. Trust your intuition and take bold steps forward.",
  "A cosmic shift brings unexpected opportunities. Keep your eyes open for new connections.",
  "Mercury's influence sharpens your communication. Express your deepest thoughts with confidence.",
];

const Index = () => {
  const { t } = useLanguage();
  const today = new Date();
  const insightIndex = today.getDate() % dailyInsights.length;

  // Placeholder Big 3 (will be calculated from user's birth data later)
  const big3 = {
    sun: { sign: "Leo", emoji: "♌" },
    moon: { sign: "Pisces", emoji: "♓" },
    rising: { sign: "Scorpio", emoji: "♏" },
  };

  return (
    <div className="flex flex-col">
      <AppHeader />

      <div className="px-4 py-6 space-y-5">
        {/* Big 3 Card */}
        <section className="glass rounded-2xl p-5 shadow-gold">
          <h2 className="font-serif text-xl text-gradient-gold mb-4">{t("dashboard.big3")}</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: t("dashboard.sun"), icon: Sun, ...big3.sun },
              { label: t("dashboard.moon"), icon: Moon, ...big3.moon },
              { label: t("dashboard.rising"), icon: Sunrise, ...big3.rising },
            ].map(({ label, icon: Icon, sign, emoji }) => (
              <div key={label} className="flex flex-col items-center gap-2 glass rounded-xl p-3">
                <Icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                <span className="text-2xl">{emoji}</span>
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-sm font-semibold text-foreground">{sign}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Daily Insight */}
        <section className="glass rounded-2xl p-5 shadow-purple">
          <h2 className="font-serif text-xl text-gradient-gold mb-3">{t("dashboard.daily")}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            ✨ {dailyInsights[insightIndex]}
          </p>
        </section>
      </div>
    </div>
  );
};

export default Index;
