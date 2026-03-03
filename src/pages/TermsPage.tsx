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
        <h1 className="font-serif text-lg text-foreground">{t("legal.termsTitle")}</h1>
      </div>

      <div className="px-5 py-6 max-w-lg mx-auto space-y-6 text-sm text-muted-foreground leading-relaxed">
        {/* Disclaimer */}
        <section className="space-y-2">
          <h2 className="font-serif text-base text-foreground">{t("legal.disclaimerTitle")}</h2>
          <p>{t("legal.disclaimerText")}</p>
        </section>

        {/* Refund Policy */}
        <section className="space-y-2">
          <h2 className="font-serif text-base text-foreground">{t("legal.refundTitle")}</h2>
          <p>{t("legal.refundText")}</p>
        </section>

        {/* Placeholder sections */}
        <section className="space-y-2">
          <h2 className="font-serif text-base text-foreground">{t("legal.useTitle")}</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-base text-foreground">{t("legal.ipTitle")}</h2>
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-base text-foreground">{t("legal.liabilityTitle")}</h2>
          <p>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, 
            totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-base text-foreground">{t("legal.changesTitle")}</h2>
          <p>
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores 
            eos qui ratione voluptatem sequi nesciunt.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsPage;
