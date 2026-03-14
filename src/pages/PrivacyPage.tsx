import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="sticky top-0 z-10 glass border-b border-border/30 px-4 py-3 flex items-center gap-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-serif text-lg text-foreground">{t("privacy.title")}</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-6 max-w-lg mx-auto space-y-6 text-sm text-muted-foreground leading-relaxed pb-12">
          <p className="text-xs">{t("privacy.effectiveDate")}</p>

          {[1, 2, 3, 4].map((n) => (
            <section key={n} className="space-y-2">
              <h2 className="font-serif text-base text-foreground">{t(`privacy.s${n}.title`)}</h2>
              <p>{t(`privacy.s${n}.text`)}</p>
            </section>
          ))}

          <section className="space-y-2">
            <h2 className="font-serif text-base text-foreground">{t("privacy.s5.title")}</h2>
            <p>
              {t("privacy.s5.text")}{" "}
              <a href="mailto:support@astrochat.ge" className="text-primary hover:underline">
                support@astrochat.ge
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
