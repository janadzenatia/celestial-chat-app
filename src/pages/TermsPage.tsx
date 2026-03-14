import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TermsPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const bullets = t("terms.s3.bullets").split("|");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="sticky top-0 z-10 glass border-b border-border/30 px-4 py-3 flex items-center gap-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-serif text-lg text-foreground">{t("terms.title")}</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-6 max-w-lg mx-auto space-y-6 text-sm text-muted-foreground leading-relaxed pb-12">
          <p>{t("terms.intro")}</p>

          {[1, 2].map((n) => (
            <section key={n} className="space-y-2">
              <h2 className="font-serif text-base text-foreground">{t(`terms.s${n}.title`)}</h2>
              <p className="whitespace-pre-line">{t(`terms.s${n}.text`)}</p>
            </section>
          ))}

          <section className="space-y-2">
            <h2 className="font-serif text-base text-foreground">{t("terms.s3.title")}</h2>
            <p>{t("terms.s3.text")}</p>
            <ul className="list-disc pl-5 space-y-1">
              {bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </section>

          {[4, 5, 6].map((n) => (
            <section key={n} className="space-y-2">
              <h2 className="font-serif text-base text-foreground">{t(`terms.s${n}.title`)}</h2>
              <p className="whitespace-pre-line">{t(`terms.s${n}.text`)}</p>
            </section>
          ))}

          <section className="space-y-2">
            <h2 className="font-serif text-base text-foreground">{t("terms.s7.title")}</h2>
            <p>
              {t("terms.s7.text")}{" "}
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

export default TermsPage;
