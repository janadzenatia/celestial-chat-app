import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, getEffectivePlan } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { purchaseSubscription } from "@/services/subscriptionService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Crown, Check, Loader2, Sparkles } from "lucide-react";

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  highlightPlan?: string; // kept for API compat, ignored
}

const PaywallModal = ({ open, onOpenChange, onSuccess }: PaywallModalProps) => {
  const { t, language } = useLanguage();
  const { user, refreshProfile, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const effectivePlan = getEffectivePlan(profile);
  const isPremium = effectivePlan === "premium";

  const features = [
    { en: "Unlimited AI Chat Messages", ka: "შეუზღუდავი AI ჩატის შეტყობინებები" },
    { en: "Deep Compatibility Analysis", ka: "ღრმა თავსებადობის ანალიზი" },
    { en: "Cosmic Calendar & Traffic Light", ka: "კოსმიური კალენდარი და შუქნიშანი" },
    { en: "Wealth & Career Destiny", ka: "სიმდიდრე და კარიერის ბედისწერა" },
    { en: "Family Cosmic Balance", ka: "ოჯახის კოსმიური ბალანსი" },
    { en: "Cosmic Blueprint & Daily Alerts", ka: "კოსმიური გეგმა და დღიური შეტყობინებები" },
  ];

  const handlePurchase = async () => {
    if (!user) return;
    setLoading(true);

    const result = await purchaseSubscription(user.id, "premium");

    if (!result.success) {
      toast({ title: t("paywall.error"), variant: "destructive" });
    } else {
      await refreshProfile();
      toast({ title: t("paywall.success") });
      onOpenChange(false);
      onSuccess?.();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-primary/20 max-w-sm mx-auto rounded-2xl p-0 overflow-hidden">
        {/* Hero header */}
        <div className="gradient-cosmic px-6 pt-8 pb-6 text-center space-y-2">
          <Crown className="w-10 h-10 text-primary mx-auto" />
          <DialogHeader className="space-y-1">
            <DialogTitle className="font-serif text-2xl text-gradient-gold">
              {t("paywall.title")}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              {t("paywall.subtitle")}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 space-y-5">
          {/* Single price card */}
          <div className="rounded-xl p-4 text-center border border-primary bg-primary/10 shadow-lg">
            <span className="block text-2xl font-bold text-foreground">
              $1.99
              <span className="text-sm font-normal text-muted-foreground">
                {language === "ka" ? "/თვეში" : "/month"}
              </span>
            </span>
            <span className="block text-xs text-primary mt-1 font-semibold">
              {language === "ka" ? "პრემიუმი" : "Premium"}
            </span>
          </div>

          {/* Features list */}
          <div className="space-y-2.5">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm text-foreground">
                <span className="w-5 h-5 rounded-full gradient-gold flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </span>
                <span>{language === "ka" ? f.ka : f.en}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={handlePurchase}
            disabled={loading || isPremium}
            className="w-full py-3.5 rounded-xl gradient-gold text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("paywall.processing")}
              </>
            ) : isPremium ? (
              language === "ka" ? "პრემიუმი აქტიურია ✓" : "Premium Active ✓"
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {t("paywall.unlock")}
              </>
            )}
          </button>

          <p className="text-[10px] text-muted-foreground text-center">
            {t("paywall.disclaimer")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaywallModal;
