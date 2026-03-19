import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWealthReport } from "@/hooks/useWealthReport";
import { useRegenerateGuard } from "@/hooks/useRegenerateGuard";
import RegenerateConfirmDialog from "@/components/RegenerateConfirmDialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, Briefcase, Gem, TrendingUp, RefreshCw } from "lucide-react";
import PremiumBadge from "@/components/PremiumBadge";

const WealthCareerCard = () => {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const { report, loading, fetching, generate } = useWealthReport();
  const { confirmOpen, requestRegenerate, confirmRegenerate, cancelRegenerate } = useRegenerateGuard(generate);

  if (!profile?.date_of_birth) return null;

  return (
    <section className="glass rounded-2xl p-5 shadow-gold">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-serif text-xl text-gradient-gold">{t("wealth.title")}</h2>
        <PremiumBadge />
      </div>

      {fetching ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{t("family.loading")}</span>
        </div>
      ) : !report ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("wealth.description")}
          </p>
          <button
            onClick={generate}
            disabled={loading}
            className="w-full py-3 rounded-xl gradient-cosmic text-foreground font-semibold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("wealth.generating")}
              </>
            ) : (
              <>✨ {t("wealth.unlock")}</>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <Accordion type="multiple" className="space-y-2">
            <AccordionItem value="calling" className="glass rounded-xl border-white/10 px-4">
              <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
                <span className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  {t("wealth.calling")}
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {report.cosmic_calling}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="wealth" className="glass rounded-xl border-white/10 px-4">
              <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
                <span className="flex items-center gap-2">
                  <Gem className="w-4 h-4 text-primary" />
                  {t("wealth.dna")}
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {report.wealth_dna}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="timeline" className="glass rounded-xl border-white/10 px-4">
              <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  {t("wealth.timeline")}
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {report.career_timeline}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <button
            onClick={requestRegenerate}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mx-auto pt-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            {t("family.regenerate")}
          </button>
        </div>
      )}

      <RegenerateConfirmDialog open={confirmOpen} onConfirm={confirmRegenerate} onCancel={cancelRegenerate} />
    </section>
  );
};

export default WealthCareerCard;
