import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 glass border-b border-border/30 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-serif text-lg text-foreground">{t("privacy.title")}</h1>
      </div>

      <div className="px-5 py-6 max-w-lg mx-auto space-y-6 text-sm text-muted-foreground leading-relaxed">
        <p className="text-xs">{t("privacy.effectiveDate")}</p>

        <section className="space-y-2">
          <h2 className="font-serif text-base text-foreground">{t("privacy.s1.title")}</h2>
          <p>{t("privacy.s1.text")}</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-base text-foreground">{t("privacy.s2.title")}</h2>
          <p>{t("privacy.s2.text")}</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-base text-foreground">{t("privacy.s3.title")}</h2>
          <p>{t("privacy.s3.text")}</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-base text-foreground">{t("privacy.s4.title")}</h2>
          <p>{t("privacy.s4.text")}</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-base text-foreground">{t("privacy.s5.title")}</h2>
          <p>
            {t("privacy.s5.text")}{" "}
            <a href="mailto:Natia_janadze@yahoo.com" className="text-primary hover:underline">
              Natia_janadze@yahoo.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPage;
