import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, getEffectivePlan } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Crown, Check, Loader2, Sparkles, MessageCircle, Infinity, Clock, Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  /** If set, highlight a specific plan */
  highlightPlan?: "basic_premium" | "pro_premium";
}

const PaywallModal = ({ open, onOpenChange, onSuccess, highlightPlan }: PaywallModalProps) => {
  const { t, language } = useLanguage();
  const { user, refreshProfile, profile } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<"basic_premium" | "pro_premium">(highlightPlan || "pro_premium");
  const [loading, setLoading] = useState(false);

  const effectivePlan = getEffectivePlan(profile);

  const plans = {
    basic_premium: {
      en: { price: "$1.99", period: "/mo", label: "Basic Plan" },
      ka: { price: "4.99 ₾", period: "/თვე", label: "ბაზისური გეგმა" },
    },
    pro_premium: {
      en: { price: "$2.99", period: "/mo", label: "Pro Plan" },
      ka: { price: "6.99 ₾", period: "/თვე", label: "პრო გეგმა" },
    },
  };

  const features = [
    {
      icon: Check,
      en: "Deep Synastry & All Features",
      ka: "ღრმა სინასტრია და ყველა ფუნქცია",
      basic: true,
      pro: true,
    },
    {
      icon: MessageCircle,
      en: "AI Chat Messages",
      ka: "AI ჩატის შეტყობინებები",
      basic: false,
      pro: false,
      basicLabel: { en: "5/day", ka: "5/დღე" },
      proLabel: { en: "Unlimited", ka: "შეუზღუდავი" },
    },
    {
      icon: Clock,
      en: "Chat History",
      ka: "ჩატის ისტორია",
      basic: false,
      pro: false,
      basicLabel: { en: "7 days", ka: "7 დღე" },
      proLabel: { en: "Forever", ka: "სამუდამოდ" },
    },
  ];

  const handlePurchase = async () => {
    if (!user) return;
    setLoading(true);

    // Mock 2-second payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const { error } = await supabase
      .from("profiles")
      .update({
        subscription_plan: selectedPlan,
        subscription_status: "premium",
        is_premium: true,
        trial_end_date: null,
      })
      .eq("user_id", user.id);

    if (error) {
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
          {/* Plan cards */}
          <div className="flex gap-2">
            {(["basic_premium", "pro_premium"] as const).map((p) => {
              const info = plans[p][language];
              const isActive = selectedPlan === p;
              const isCurrent = effectivePlan === p;
              return (
                <button
                  key={p}
                  onClick={() => setSelectedPlan(p)}
                  disabled={isCurrent}
                  className={cn(
                    "flex-1 relative rounded-xl p-3 text-center transition-all border",
                    isActive
                      ? "border-primary bg-primary/10 shadow-lg"
                      : "border-border/30 hover:border-primary/40",
                    isCurrent && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {p === "pro_premium" && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full gradient-gold text-primary-foreground">
                      {language === "ka" ? "რეკომენდებული" : "Recommended"}
                    </span>
                  )}
                  <span className="block text-lg font-bold text-foreground">
                    {info.price}
                    <span className="text-xs font-normal text-muted-foreground">{info.period}</span>
                  </span>
                  <span className="block text-[10px] text-muted-foreground mt-0.5">{info.label}</span>
                  {isCurrent && (
                    <span className="block text-[9px] text-primary mt-1">
                      {language === "ka" ? "მიმდინარე" : "Current"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Comparison table */}
          <div className="space-y-2.5">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm text-foreground">
                <span className="w-5 h-5 rounded-full gradient-gold flex items-center justify-center shrink-0">
                  <f.icon className="w-3 h-3 text-primary-foreground" />
                </span>
                <span className="flex-1">{f[language]}</span>
                {f.basicLabel && (
                  <div className="flex gap-1.5 text-[10px]">
                    <span className={cn(
                      "px-1.5 py-0.5 rounded-md",
                      selectedPlan === "basic_premium" ? "bg-primary/20 text-primary font-semibold" : "text-muted-foreground"
                    )}>
                      {f.basicLabel[language]}
                    </span>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded-md",
                      selectedPlan === "pro_premium" ? "bg-primary/20 text-primary font-semibold" : "text-muted-foreground"
                    )}>
                      {f.proLabel?.[language]}
                    </span>
                  </div>
                )}
                {!f.basicLabel && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={handlePurchase}
            disabled={loading || effectivePlan === selectedPlan}
            className="w-full py-3.5 rounded-xl gradient-gold text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("paywall.processing")}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {effectivePlan === "basic_premium" && selectedPlan === "pro_premium"
                  ? (language === "ka" ? "გააუმჯობესე პრო-მდე" : "Upgrade to Pro")
                  : t("paywall.unlock")}
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
