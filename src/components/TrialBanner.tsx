import { useAuth, getEffectivePlan } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Clock } from "lucide-react";

const TrialBanner = () => {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const effectivePlan = getEffectivePlan(profile);

  if (!profile?.trial_end_date || effectivePlan === "free") return null;

  const endDate = new Date(profile.trial_end_date);
  const now = new Date();
  const diffMs = endDate.getTime() - now.getTime();

  if (diffMs <= 0) return null;

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  const remainingHours = diffHours % 24;

  let timeText: string;
  if (diffDays > 0) {
    timeText = `${diffDays}${t("trial.days")}${remainingHours > 0 ? ` ${remainingHours}${t("trial.hours")}` : ""}`;
  } else {
    timeText = `${diffHours}${t("trial.hours")}`;
  }

  return (
    <div className="glass rounded-xl p-3 flex items-start gap-3 border border-primary/20">
      <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
      <p className="text-xs text-muted-foreground leading-relaxed">
        {t("trial.notice").replace("{time}", timeText)}
      </p>
    </div>
  );
};

export default TrialBanner;
