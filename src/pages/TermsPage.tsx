import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TermsPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 glass border-b border-border/30 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-serif text-lg text-foreground">{t("terms.title")}</h1>
      </div>

      <div className="px-5 py-6 max-w-lg mx-auto space-y-6 text-sm text-muted-foreground leading-relaxed">
        {[1, 2, 3, 4, 5].map((n) => (
          <section key={n} className="space-y-2">
            <h2 className="font-serif text-base text-foreground">{t(`terms.s${n}.title`)}</h2>
            <p>{t(`terms.s${n}.text`)}</p>
          </section>
        ))}
      </div>
    </div>
  );
};

export default TermsPage;
