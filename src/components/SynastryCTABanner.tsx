import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const SynastryCTABanner = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section className="relative rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(270 50% 25% / 0.6), hsl(222 47% 14% / 0.8), hsl(38 92% 30% / 0.4))" }}>
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, hsl(270 60% 60%), transparent 50%), radial-gradient(circle at 80% 50%, hsl(38 92% 50%), transparent 50%)" }} />
      <div className="relative z-10 p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full gradient-cosmic flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground leading-relaxed">
              {t("synastry.cta.message")}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/compatibility")}
          className="w-full gradient-gold text-primary-foreground font-semibold text-sm px-5 py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          {t("synastry.cta.button")}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};

export default SynastryCTABanner;
