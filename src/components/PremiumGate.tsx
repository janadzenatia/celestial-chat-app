import { useState } from "react";
import { useAuth, getEffectivePlan } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import PaywallModal from "./PaywallModal";
import { Lock, Sparkles } from "lucide-react";

interface PremiumGateProps {
  children: React.ReactNode;
  overlay?: boolean;
  /** Translation key for preview title shown above the blurred content */
  previewTitleKey?: string;
  /** Translation keys for 2-3 bullet points describing the locked benefits */
  previewBulletKeys?: string[];
}

const PremiumGate = ({ children, previewTitleKey, previewBulletKeys }: PremiumGateProps) => {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [paywallOpen, setPaywallOpen] = useState(false);

  const plan = getEffectivePlan(profile);
  const hasAccess = plan === "premium";

  if (hasAccess) return <>{children}</>;

  const title = previewTitleKey ? t(previewTitleKey) : null;
  const bullets = previewBulletKeys?.map((k) => t(k)) ?? [];

  return (
    <>
      {(title || bullets.length > 0) && (
        <div
          className="rounded-2xl border border-primary/20 bg-card/60 p-4 mb-2 cursor-pointer"
          onClick={() => setPaywallOpen(true)}
        >
          {title && (
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            </div>
          )}
          {bullets.length > 0 && (
            <ul className="space-y-1">
              {bullets.map((b, i) => (
                <li key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div
        className="relative rounded-2xl overflow-visible cursor-pointer"
        onClick={() => setPaywallOpen(true)}
      >
        <div
          className="pointer-events-none select-none overflow-hidden rounded-2xl"
          style={{ filter: "blur(12px)" }}
        >
          {children}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/30 gap-3">
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
};

export default PremiumGate;
