import { Heart, Flame, MessageCircle, Target, Loader2, Sparkles, RefreshCw, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { SynastryReport } from "@/hooks/useSynastryReport";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useRegenerateGuard } from "@/hooks/useRegenerateGuard";
import RegenerateConfirmDialog from "@/components/RegenerateConfirmDialog";

const categories = [
  {
    key: "emotional" as const,
    icon: Heart,
    emoji: "❤️",
    translationKey: "synastry.emotional",
    gradient: "from-pink-500/20 to-rose-500/20",
    border: "border-pink-500/30",
    scoreColor: "text-pink-400",
  },
  {
    key: "romantic" as const,
    icon: Flame,
    emoji: "🔥",
    translationKey: "synastry.romantic",
    gradient: "from-orange-500/20 to-red-500/20",
    border: "border-orange-500/30",
    scoreColor: "text-orange-400",
  },
  {
    key: "communication" as const,
    icon: MessageCircle,
    emoji: "💬",
    translationKey: "synastry.communication",
    gradient: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/30",
    scoreColor: "text-blue-400",
  },
  {
    key: "goals" as const,
    icon: Target,
    emoji: "💰",
    translationKey: "synastry.goals",
    gradient: "from-green-500/20 to-emerald-500/20",
    border: "border-green-500/30",
    scoreColor: "text-green-400",
  },
];

interface SynastryReportCardProps {
  report: SynastryReport | null;
  loading: boolean;
  generating: boolean;
  onGenerate: () => void;
  onRegenerate: () => void;
  userEmoji?: string;
  partnerEmoji?: string;
  partnerName?: string;
  partnerHasTime?: boolean;
}

export default function SynastryReportCard({
  report,
  loading,
  generating,
  onGenerate,
  onRegenerate,
  userEmoji,
  partnerEmoji,
  partnerName,
  partnerHasTime,
}: SynastryReportCardProps) {
  const { t } = useLanguage();
  const { confirmOpen, requestRegenerate, confirmRegenerate, cancelRegenerate } = useRegenerateGuard(onRegenerate);

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6 flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">{t("synastry.loading")}</span>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="glass rounded-2xl p-6 space-y-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-serif text-lg text-gradient-gold">{t("synastry.title")}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{t("synastry.description")}</p>
        <Button
          onClick={onGenerate}
          disabled={generating}
          className="gradient-cosmic text-foreground font-medium px-6"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t("synastry.generating")}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              {t("synastry.generate")}
            </>
          )}
        </Button>
      </div>
    );
  }

  const showTimeBanner = report.time_acknowledged || partnerHasTime;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Time Precision Banner */}
      {showTimeBanner && (
        <div className="glass rounded-2xl p-4 border border-primary/30 bg-gradient-to-r from-primary/10 to-secondary/10 flex items-start gap-3">
          <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("synastry.timeBanner").replace("{name}", partnerName || t("synastry.partner"))}
          </p>
        </div>
      )}

      {/* Overall Score */}
      <div className="glass rounded-2xl p-6 text-center space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg text-gradient-gold">{t("synastry.title")}</h3>
          <button
            onClick={requestRegenerate}
            disabled={generating}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", generating && "animate-spin")} />
          </button>
        </div>

        <div className="flex items-center justify-center gap-3">
          {userEmoji && <span className="text-3xl">{userEmoji}</span>}
          <Heart className="w-5 h-5 text-pink-400 animate-pulse" />
          {partnerEmoji && <span className="text-3xl">{partnerEmoji}</span>}
        </div>

        <div className="text-5xl font-serif font-bold text-gradient-gold">{report.overall_score}%</div>
        <p className="text-xs text-muted-foreground">{t("synastry.overallScore")}</p>

        {/* Score Bar */}
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="h-full gradient-gold rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${report.overall_score}%` }}
          />
        </div>
      </div>

      {/* Category Accordion */}
      <Accordion type="multiple" defaultValue={["emotional", "romantic", "communication", "goals"]} className="space-y-3">
        {categories.map(({ key, icon: Icon, emoji, translationKey, gradient, border, scoreColor }) => {
          const cat = report[key];
          return (
            <AccordionItem
              key={key}
              value={key}
              className={cn("glass rounded-2xl border overflow-hidden", border)}
            >
              <AccordionTrigger className="px-5 py-4 hover:no-underline">
                <div className="flex items-center gap-3 flex-1">
                  <div className={cn("w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br shrink-0", gradient)}>
                    <span className="text-base">{emoji}</span>
                  </div>
                  <span className="font-serif text-sm text-foreground text-left">{t(translationKey)}</span>
                  <span className={cn("ml-auto mr-3 text-sm font-bold tabular-nums", scoreColor)}>
                    {cat.score}%
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-4">
                {/* Mini Score Bar */}
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden mb-3">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r", gradient)}
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{cat.analysis}</p>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
