import { useAuth, getEffectivePlan } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Clock } from "lucide-react";

const TrialBanner = () => {
  const { profile } = useAuth();
  const { language } = useLanguage();
  const effectivePlan = getEffectivePlan(profile);

  if (!profile?.trial_end_date) return null;

  const endDate = new Date(profile.trial_end_date);
  const now = new Date();
  const diffMs = endDate.getTime() - now.getTime();

  // Trial expired and not premium — show expired message
  if (diffMs <= 0 && effectivePlan === "free") {
    return (
      <div className="glass rounded-xl p-3 flex items-start gap-3 border border-destructive/20">
        <Clock className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          {language === "ka"
            ? "შენი 3-დღიანი საცდელი პერიოდი დასრულდა. გააქტიურე პრემიუმი და განაგრძე კოსმიური მოგზაურობა — მხოლოდ $1.99/თვეში"
            : "Your 3-day free trial has ended. Activate Premium and continue your cosmic journey — only $1.99/month"}
        </p>
      </div>
    );
  }

  // Trial expired but premium — don't show banner
  if (diffMs <= 0) return null;

  // Active trial countdown
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  const remainingHours = diffHours % 24;

  let timeText: string;
  if (diffDays > 0) {
    timeText = language === "ka"
      ? `${diffDays} დღე${remainingHours > 0 ? ` ${remainingHours} სთ` : ""}`
      : `${diffDays}d${remainingHours > 0 ? ` ${remainingHours}h` : ""}`;
  } else {
    timeText = language === "ka" ? `${diffHours} სთ` : `${diffHours}h`;
  }

  return (
    <div className="glass rounded-xl p-3 flex items-start gap-3 border border-primary/20">
      <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
      <p className="text-xs text-muted-foreground leading-relaxed">
        {language === "ka"
          ? `${timeText} დარჩა უფასო საცდელი პერიოდიდან`
          : `${timeText} left in your free trial`}
      </p>
    </div>
  );
};

export default TrialBanner;
