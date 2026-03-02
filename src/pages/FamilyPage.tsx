import { useState } from "react";
import { Baby, Users, Puzzle, Calculator, Lock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import AppHeader from "@/components/AppHeader";
import MyChildrenTab from "@/components/family/MyChildrenTab";
import MissingPieceTab from "@/components/family/MissingPieceTab";
import ZodiacCalculatorTab from "@/components/family/ZodiacCalculatorTab";
import PaywallModal from "@/components/PaywallModal";
import { cn } from "@/lib/utils";

type FamilyTab = "children" | "missing" | "calculator";

const PREMIUM_TABS: FamilyTab[] = ["children", "missing"];

const FamilyPage = () => {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<FamilyTab>("calculator");
  const [paywallOpen, setPaywallOpen] = useState(false);

  const isPremium = profile?.subscription_status === "premium" || profile?.is_premium;

  const tabs = [
    { key: "children" as FamilyTab, icon: Users, label: t("family.myChildren") },
    { key: "missing" as FamilyTab, icon: Puzzle, label: t("family.missingPiece") },
    { key: "calculator" as FamilyTab, icon: Calculator, label: t("family.calculator") },
  ];

  const handleTabClick = (key: FamilyTab) => {
    if (PREMIUM_TABS.includes(key) && !isPremium) {
      setPaywallOpen(true);
      return;
    }
    setActiveTab(key);
  };

  return (
    <div className="flex flex-col">
      <AppHeader />
      <div className="flex-1 px-4 py-6 space-y-5">
        {/* Title */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2">
            <Baby className="w-6 h-6 text-primary" />
            <h1 className="font-serif text-2xl text-gradient-gold">{t("family.title")}</h1>
          </div>
          <p className="text-xs text-muted-foreground">{t("family.subtitle")}</p>
        </div>

        {/* Sub-navigation */}
        <div className="flex gap-1 p-1 glass rounded-xl">
          {tabs.map(({ key, icon: Icon, label }) => {
            const isLocked = PREMIUM_TABS.includes(key) && !isPremium;
            return (
              <button
                key={key}
                onClick={() => handleTabClick(key)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg text-xs font-medium transition-all duration-200",
                  activeTab === key
                    ? "gradient-cosmic text-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="relative">
                  <Icon className="w-4 h-4" />
                  {isLocked && (
                    <Lock className="w-2.5 h-2.5 text-primary absolute -top-1 -right-2" />
                  )}
                </div>
                <span className="leading-tight text-center">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === "children" && (isPremium ? <MyChildrenTab /> : <PremiumFallback />)}
        {activeTab === "missing" && (isPremium ? <MissingPieceTab /> : <PremiumFallback />)}
        {activeTab === "calculator" && <ZodiacCalculatorTab />}
      </div>

      <PaywallModal open={paywallOpen} onOpenChange={setPaywallOpen} />
    </div>
  );
};

/** Render-level guard: if a free user somehow reaches premium content */
const PremiumFallback = () => {
  const { t } = useLanguage();
  return (
    <div className="glass rounded-2xl p-8 text-center space-y-3">
      <Lock className="w-8 h-8 text-primary mx-auto" />
      <p className="text-sm font-medium text-muted-foreground">{t("paywall.premiumContent")}</p>
    </div>
  );
};

export default FamilyPage;
