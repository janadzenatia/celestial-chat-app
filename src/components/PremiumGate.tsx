import { useState } from "react";
import { useAuth, getEffectivePlan } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import PaywallModal from "./PaywallModal";
import { Lock } from "lucide-react";

interface PremiumGateProps {
  children: React.ReactNode;
  overlay?: boolean;
}

const PremiumGate = ({ children, overlay = false }: PremiumGateProps) => {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [paywallOpen, setPaywallOpen] = useState(false);

  const plan = getEffectivePlan(profile);
  const hasAccess = plan === "premium";

  if (hasAccess) return <>{children}</>;

  if (overlay) {
    return (
      <>
        <div className="relative rounded-2xl overflow-hidden" onClick={() => setPaywallOpen(true)}>
          <div className="pointer-events-none select-none" style={{ filter: "blur(12px)" }}>
            {children}
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer bg-background/30 gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <button className="gradient-gold text-primary-foreground font-semibold text-sm px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
              {t("premiumGate.upgrade")}
            </button>
          </div>
        </div>
        <PaywallModal open={paywallOpen} onOpenChange={setPaywallOpen} />
      </>
    );
  }

  return (
    <>
      <div onClick={() => setPaywallOpen(true)} className="cursor-pointer">
        {children}
      </div>
      <PaywallModal open={paywallOpen} onOpenChange={setPaywallOpen} />
    </>
  );
};

export default PremiumGate;
