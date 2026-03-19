import { useState } from "react";
import { Loader2, Calendar, TrendingUp, AlertTriangle, Minus, Sparkles, RefreshCw, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { ForecastPeriod } from "@/hooks/useRelationshipForecast";
import { Button } from "@/components/ui/button";
import { BirthDatePicker } from "@/components/BirthDatePicker";
import { useRegenerateGuard } from "@/hooks/useRegenerateGuard";
import RegenerateConfirmDialog from "@/components/RegenerateConfirmDialog";

const typeConfig = {
  positive: {
    icon: TrendingUp,
    color: "text-green-400",
    bg: "from-green-500/20 to-emerald-500/20",
    border: "border-green-500/30",
  },
  challenge: {
    icon: AlertTriangle,
    color: "text-orange-400",
    bg: "from-orange-500/20 to-red-500/20",
    border: "border-orange-500/30",
  },
  neutral: {
    icon: Minus,
    color: "text-blue-400",
    bg: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/30",
  },
};

interface RelationshipForecastProps {
  intro?: string;
  periods: ForecastPeriod[] | null;
  loading: boolean;
  generating: boolean;
  onGenerate: () => void;
  onRegenerate: () => void;
  relationshipDate?: Date;
  onRelationshipDateChange?: (date: Date | undefined) => void;
}

export default function RelationshipForecastCard({
  intro,
  periods,
  loading,
  generating,
  onGenerate,
  onRegenerate,
  relationshipDate,
  onRelationshipDateChange,
}: RelationshipForecastProps) {
  const { t } = useLanguage();
  const { confirmOpen, requestRegenerate, confirmRegenerate, cancelRegenerate } = useRegenerateGuard(onRegenerate);
  const [showDatePicker, setShowDatePicker] = useState(false);

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6 flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">{t("forecast.loading")}</span>
      </div>
    );
  }

  // Teaser state: no forecast yet
  if (!periods) {
    const hasRelDate = Boolean(relationshipDate);

    return (
      <div className="glass rounded-2xl p-6 space-y-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-serif text-lg text-gradient-gold">{t("forecast.title")}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{t("forecast.description")}</p>

        {/* Inline date picker for relationship date */}
        {showDatePicker && !hasRelDate && onRelationshipDateChange && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="text-sm font-medium text-foreground">{t("compat.relationshipDate")}</label>
            <BirthDatePicker
              value={relationshipDate}
              onChange={(d) => {
                onRelationshipDateChange(d);
              }}
              placeholder={t("compat.pickDate")}
            />
          </div>
        )}

        {!hasRelDate && !showDatePicker ? (
          <Button
            onClick={() => setShowDatePicker(true)}
            className="gradient-cosmic text-foreground font-medium px-6"
          >
            <Lock className="w-4 h-4 mr-2" />
            {t("forecast.unlock")}
          </Button>
        ) : hasRelDate ? (
          <Button
            onClick={onGenerate}
            disabled={generating}
            className="gradient-cosmic text-foreground font-medium px-6"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("forecast.generating")}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {t("forecast.generate")}
              </>
            )}
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-serif text-lg text-gradient-gold">{t("forecast.title")}</h3>
        </div>
        <button
          onClick={requestRegenerate}
          disabled={generating}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("w-4 h-4", generating && "animate-spin")} />
        </button>
      </div>

      {/* Intro paragraph */}
      {intro && (
        <div className="glass rounded-2xl p-5">
          <p className="text-sm text-muted-foreground leading-relaxed italic">{intro}</p>
        </div>
      )}

      {/* Timeline */}
      <div className="relative space-y-4">
        <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gradient-to-b from-primary/50 via-secondary/50 to-primary/50" />
        {periods.map((period, i) => {
          const config = typeConfig[period.type] || typeConfig.neutral;
          const Icon = config.icon;
          return (
            <div key={i} className="relative flex gap-4">
              <div className={cn(
                "relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br border",
                config.bg, config.border
              )}>
                <Icon className={cn("w-4 h-4", config.color)} />
              </div>
              <div className={cn("glass rounded-xl p-4 flex-1 space-y-1")}>
                <div className="flex items-center justify-between">
                  <span className={cn("text-xs font-semibold uppercase tracking-wider", config.color)}>
                    {period.month}
                  </span>
                </div>
                <h4 className="font-serif text-sm text-foreground">{period.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{period.description}</p>
              </div>
            </div>
          );
        })}
      </div>
      <RegenerateConfirmDialog open={confirmOpen} onConfirm={confirmRegenerate} onCancel={cancelRegenerate} />
    </div>
  );
}
