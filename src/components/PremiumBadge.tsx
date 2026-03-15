import { Lock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface PremiumBadgeProps {
  className?: string;
}

const PremiumBadge = ({ className }: PremiumBadgeProps) => {
  const { t } = useLanguage();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider text-white",
        "bg-gradient-to-r from-purple-500 to-violet-600 shadow-[0_0_8px_hsl(270_60%_50%/0.4)]",
        className
      )}
    >
      <Lock className="w-3 h-3" />
      {t("cosmic.badge")}
    </span>
  );
};

export default PremiumBadge;
