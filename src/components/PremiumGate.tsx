import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Lock } from "lucide-react";
import PaywallModal from "./PaywallModal";

interface PremiumGateProps {
  children: React.ReactNode;
  /** If true, shows a lock overlay on the content instead of replacing it */
  overlay?: boolean;
}

const PremiumGate = ({ children, overlay = false }: PremiumGateProps) => {
  const { profile } = useAuth();
  const [paywallOpen, setPaywallOpen] = useState(false);

  const isPremium = profile?.subscription_status === "premium" || profile?.is_premium;

  if (isPremium) return <>{children}</>;

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
