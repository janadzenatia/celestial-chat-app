import { useState } from "react";
import { Baby, Users, Puzzle, Calculator } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import AppHeader from "@/components/AppHeader";
import MyChildrenTab from "@/components/family/MyChildrenTab";
import MissingPieceTab from "@/components/family/MissingPieceTab";
import ZodiacCalculatorTab from "@/components/family/ZodiacCalculatorTab";
import { cn } from "@/lib/utils";

type FamilyTab = "children" | "missing" | "calculator";

const FamilyPage = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<FamilyTab>("children");

  const tabs = [
    { key: "children" as FamilyTab, icon: Users, label: t("family.myChildren") },
    { key: "missing" as FamilyTab, icon: Puzzle, label: t("family.missingPiece") },
    { key: "calculator" as FamilyTab, icon: Calculator, label: t("family.calculator") },
  ];

  return (
    <div className="flex flex-col">
      <AppHeader />
      <div className="flex-1 px-4 py-6 space-y-5">
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2">
            <Baby className="w-6 h-6 text-primary" />
            <h1 className="font-serif text-2xl text-gradient-gold">{t("family.title")}</h1>
          </div>
          <p className="text-xs text-muted-foreground">{t("family.subtitle")}</p>
        </div>

        <div className="flex gap-1 p-1 glass rounded-xl">
          {tabs.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg text-xs font-medium transition-all duration-200",
                activeTab === key
                  ? "gradient-cosmic text-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="leading-tight text-center">{label}</span>
            </button>
          ))}
        </div>

        {activeTab === "children" && <MyChildrenTab />}
        {activeTab === "missing" && <MissingPieceTab />}
        {activeTab === "calculator" && <ZodiacCalculatorTab />}
      </div>
    </div>
  );
};

export default FamilyPage;
