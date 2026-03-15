import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Section = ({ title, text, bullets }: { title: string; text?: string; bullets?: string }) => (
  <section className="space-y-2">
    <h2 className="font-serif text-base font-semibold text-foreground">{title}</h2>
    {text && <p>{text}</p>}
    {bullets && (
      <ul className="list-disc pl-5 space-y-1">
        {bullets.split("|").map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
    )}
  </section>
);

const TermsPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/30 px-4 py-3 flex items-center gap-3" style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}>
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-serif text-lg text-foreground">{t("terms.title")}</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-6 max-w-lg mx-auto space-y-6 text-sm text-muted-foreground leading-relaxed pb-12" style={{ paddingTop: "60px" }}>
          <p>{t("terms.intro")}</p>

          <Section title={t("terms.s1.title")} text={t("terms.s1.text")} />
          <Section title={t("terms.s2.title")} text={t("terms.s2.text")} bullets={t("terms.s2.bullets")} />
          <Section title={t("terms.s3.title")} text={t("terms.s3.text")} bullets={t("terms.s3.bullets")} />
          <Section title={t("terms.s4.title")} text={t("terms.s4.text")} />
          <Section title={t("terms.s5.title")} text={t("terms.s5.text")} />
          <Section title={t("terms.s6.title")} text={t("terms.s6.text")} />

          <section className="space-y-2">
            <h2 className="font-serif text-base font-semibold text-foreground">{t("terms.s7.title")}</h2>
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
