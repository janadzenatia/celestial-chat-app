import AppHeader from "@/components/AppHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { Heart, Lock } from "lucide-react";

const CompatibilityPage = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col">
      <AppHeader />
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center space-y-4 glass rounded-2xl p-8">
          <div className="w-16 h-16 rounded-full gradient-purple mx-auto flex items-center justify-center">
            <Lock className="w-7 h-7 text-foreground" />
          </div>
          <h2 className="font-serif text-xl text-gradient-gold">{t("nav.compatibility")}</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            Unlock cosmic compatibility readings with Premium.
          </p>
          <button className="gradient-gold text-primary-foreground font-semibold px-6 py-2.5 rounded-full text-sm shadow-gold">
            {t("premium.upgrade")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompatibilityPage;
