import { useState } from "react";
import { useAuth, getEffectivePlan } from "@/contexts/AuthContext";
import PaywallModal from "./PaywallModal";
import PremiumBadge from "./PremiumBadge";

interface PremiumGateProps {
  children: React.ReactNode;
  /** If true, shows a lock overlay on the content instead of replacing it */
  overlay?: boolean;
  /** Minimum plan required. Defaults to basic_premium */
  minPlan?: "basic_premium" | "pro_premium";
}

const PremiumGate = ({ children, overlay = false, minPlan = "basic_premium" }: PremiumGateProps) => {
  const { profile } = useAuth();
  const [paywallOpen, setPaywallOpen] = useState(false);

  const plan = getEffectivePlan(profile);
  const planLevel = { free: 0, basic_premium: 1, pro_premium: 2 };
  const hasAccess = planLevel[plan] >= planLevel[minPlan];

  if (hasAccess) return <>{children}</>;

  if (overlay) {
    return (
      <>
        <div className="relative" onClick={() => setPaywallOpen(true)}>
          <div className="pointer-events-none opacity-50 blur-[1px]">
            {children}
          </div>
          <div className="absolute inset-0 flex items-center justify-center cursor-pointer">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-xs font-semibold text-primary border border-primary/30">
              <Lock className="w-3.5 h-3.5" />
              Premium
            </span>
          </div>
        </div>
        <PaywallModal open={paywallOpen} onOpenChange={setPaywallOpen} highlightPlan={minPlan} />
      </>
    );
  }

  return (
    <>
      <div onClick={() => setPaywallOpen(true)} className="cursor-pointer">
        {children}
      </div>
      <PaywallModal open={paywallOpen} onOpenChange={setPaywallOpen} highlightPlan={minPlan} />
    </>
  );
};

export default PremiumGate;
