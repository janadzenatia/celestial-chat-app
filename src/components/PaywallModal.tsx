import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Crown, Check, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const PaywallModal = ({ open, onOpenChange, onSuccess }: PaywallModalProps) => {
  const { t, language } = useLanguage();
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [plan, setPlan] = useState<"monthly" | "annual">("annual");
  const [loading, setLoading] = useState(false);

  const pricing = {
    monthly: {
      en: { price: "$2.99", label: "Monthly Cosmic Guide" },
      ka: { price: "6.99 ₾", label: "1 თვიანი კოსმიური გზამკვლევი" },
    },
    annual: {
      en: { price: "$19.99", label: "Annual Star Pass — Best Value" },
      ka: { price: "49.99 ₾", label: "1 წლიანი ვარსკვლავური პაკეტი — საუკეთესო არჩევანი" },
    },
  };

  const benefits = [
    { en: "Deep Synastry Analysis", ka: "ღრმა სინასტრიის ანალიზი" },
    { en: "Cosmic Traffic Light Calendar", ka: "კოსმიური შუქნიშნის კალენდარი" },
    { en: "Family Dynamics & Missing Piece", ka: "ოჯახის დინამიკა და დაკარგული ნაწილი" },
    { en: "Wealth & Career Destiny", ka: "სიმდიდრე და კარიერის ბედისწერა" },
    { en: "Unlimited AI Chat", ka: "შეუზღუდავი AI ჩატი" },
  ];

  const handlePurchase = async () => {
    if (!user) return;
    setLoading(true);

    // Mock 2-second payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const { error } = await supabase
      .from("profiles")
      .update({ subscription_status: "premium", is_premium: true })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: t("paywall.error"), variant: "destructive" });
    } else {
      await refreshProfile();
      toast({ title: t("paywall.success") });
      onOpenChange(false);
    }
    setLoading(false);
  };

  const selected = pricing[plan][language];
  const other = plan === "monthly" ? pricing.annual[language] : pricing.monthly[language];

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
          {/* Plan toggle */}
          <div className="flex gap-2">
            {(["monthly", "annual"] as const).map((p) => {
              const info = pricing[p][language];
              const isActive = plan === p;
              return (
                <button
                  key={p}
                  onClick={() => setPlan(p)}
                  className={cn(
                    "flex-1 relative rounded-xl p-3 text-center transition-all border",
                    isActive
                      ? "border-primary bg-primary/10 shadow-lg"
                      : "border-border/30 hover:border-primary/40"
                  )}
                >
                  {p === "annual" && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full gradient-gold text-primary-foreground">
                      {t("paywall.bestValue")}
                    </span>
                  )}
                  <span className="block text-lg font-bold text-foreground">{info.price}</span>
                  <span className="block text-[10px] text-muted-foreground mt-0.5">{info.label}</span>
                </button>
              );
            })}
          </div>

          {/* Benefits */}
          <ul className="space-y-2.5">
            {benefits.map((b, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm text-foreground">
                <span className="w-5 h-5 rounded-full gradient-gold flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </span>
                {b[language]}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button
            onClick={handlePurchase}
            disabled={loading}
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
