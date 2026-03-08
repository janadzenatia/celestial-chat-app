import { useNavigate } from "react-router-dom";
import { Bell, X, Loader2, Sparkles, Lock } from "lucide-react";
import { useCosmicHook } from "@/hooks/useCosmicHook";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, getEffectivePlan } from "@/contexts/AuthContext";
import { useState } from "react";
import PaywallModal from "./PaywallModal";

const CosmicHookBanner = () => {
  const { hookData, loading, dismissed, dismiss } = useCosmicHook();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { profile } = useAuth();
  const [paywallOpen, setPaywallOpen] = useState(false);

  const plan = getEffectivePlan(profile);
  const isFree = plan === "free";

  // Free users see locked teaser
  if (isFree) {
    return (
      <>
        <div
          onClick={() => setPaywallOpen(true)}
          className="relative glass rounded-2xl p-4 border border-primary/20 cursor-pointer hover:border-primary/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {t("hook.label")}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {language === "ka"
                  ? "გააქტიურე პრემიუმი, რომ მიიღო პერსონალური კოსმიური შეტყობინებები"
                  : "Upgrade to Premium to unlock your daily Cosmic Alerts"}
              </p>
            </div>
          </div>
        </div>
        <PaywallModal open={paywallOpen} onOpenChange={setPaywallOpen} />
      </>
    );
  }

  if (dismissed || (!loading && !hookData?.hook)) return null;

  const handleTap = () => {
    if (!hookData) return;
    sessionStorage.setItem(
      "chat_hook_context",
      JSON.stringify({
        hook: hookData.hook,
        subject: hookData.subject,
        subjectDob: hookData.subjectDob,
      })
    );
    navigate("/chat");
  };

  return (
    <div className="relative glass rounded-2xl p-4 border border-primary/30 shadow-gold animate-in fade-in slide-in-from-top-2 duration-500">
      <button
        onClick={(e) => {
          e.stopPropagation();
          dismiss();
        }}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted/50 transition-colors"
        aria-label={t("hook.dismiss")}
      >
        <X className="w-3.5 h-3.5 text-muted-foreground" />
      </button>

      {loading ? (
        <div className="flex items-center gap-3 pr-6">
          <div className="w-10 h-10 rounded-full gradient-cosmic flex items-center justify-center shrink-0">
            <Loader2 className="w-5 h-5 text-foreground animate-spin" />
          </div>
          <p className="text-xs text-muted-foreground">{t("hook.generating")}</p>
        </div>
      ) : (
        <button onClick={handleTap} className="flex items-start gap-3 text-left w-full pr-6">
          <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center shrink-0 mt-0.5">
            <Bell className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                {t("hook.label")}
              </span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{hookData?.hook}</p>
          </div>
        </button>
      )}
    </div>
  );
};

export default CosmicHookBanner;
