import { useState } from "react";
import { useAuth, getEffectivePlan } from "@/contexts/AuthContext";
import PaywallModal from "./PaywallModal";
import PremiumBadge from "./PremiumBadge";

interface PremiumGateProps {
  children: React.ReactNode;
  overlay?: boolean;
}

const PremiumGate = ({ children, overlay = false }: PremiumGateProps) => {
  const { profile } = useAuth();
  const [paywallOpen, setPaywallOpen] = useState(false);

  const plan = getEffectivePlan(profile);
  const hasAccess = plan === "premium";

  if (hasAccess) return <>{children}</>;

  if (overlay) {
    return (
      <>
        <div className="relative" onClick={() => setPaywallOpen(true)}>
          <div className="pointer-events-none opacity-50 blur-[1px]">
            {children}
          </div>
          <div className="absolute inset-0 flex items-center justify-center cursor-pointer">
            <PremiumBadge className="text-xs px-3 py-1.5" />
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
