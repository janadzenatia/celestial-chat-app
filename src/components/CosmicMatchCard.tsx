import { useLanguage } from "@/contexts/LanguageContext";
import { useCosmicMatch } from "@/hooks/useCosmicMatch";
import { Heart, Sparkles, CalendarDays, User, Loader2, RefreshCw } from "lucide-react";

const CosmicMatchCard = () => {
  const { t } = useLanguage();
  const { match, loading, generating, generate } = useCosmicMatch();

  const isWorking = loading || generating;

  return (
    <section className="relative glass rounded-2xl p-5 overflow-hidden" style={{ boxShadow: "0 0 25px -5px hsl(270 50% 40% / 0.4), 0 0 15px -5px hsl(38 92% 50% / 0.2)" }}>
      {/* Decorative gradient border effect */}
      <div className="absolute inset-0 rounded-2xl opacity-20 pointer-events-none" style={{ background: "linear-gradient(135deg, hsl(270 50% 40% / 0.3), hsl(38 92% 50% / 0.3))" }} />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" fill="currentColor" />
            <h2 className="font-serif text-xl text-gradient-gold">{t("cosmic.title")}</h2>
          </div>
          {match && (
            <button
              onClick={generate}
              disabled={isWorking}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
              aria-label="Regenerate"
            >
              <RefreshCw className={`w-4 h-4 ${generating ? "animate-spin" : ""}`} />
            </button>
          )}
        </div>

        {/* Content */}
        {isWorking ? (
          <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground text-sm">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{t("cosmic.generating")}</span>
          </div>
        ) : match ? (
          <div className="space-y-4">
            {/* Compatible Signs */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("cosmic.signs")}</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {match.compatible_signs.map((sign) => (
                  <span
                    key={sign}
                    className="px-3 py-1.5 rounded-full text-sm font-medium glass-strong text-foreground"
                  >
                    {t(`zodiac.${sign}`)}
                  </span>
                ))}
              </div>
            </div>

            {/* Birth Years */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <CalendarDays className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("cosmic.years")}</span>
              </div>
              <div className="flex gap-2">
                {match.birth_years.map((year) => (
                  <span
                    key={year}
                    className="px-3 py-1.5 rounded-full text-sm font-medium glass-strong text-foreground tabular-nums"
                  >
                    {year}
                  </span>
                ))}
              </div>
            </div>

            {/* Personality Profile */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <User className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("cosmic.profile")}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {match.personality_profile}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-6 gap-3">
            <p className="text-sm text-muted-foreground text-center">
              💫 Discover your ideal cosmic partner based on your unique birth chart.
            </p>
            <button
              onClick={generate}
              className="gradient-cosmic text-foreground font-medium text-sm px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {t("cosmic.generate")}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CosmicMatchCard;
