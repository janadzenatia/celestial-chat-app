import { getChineseZodiac } from "@/lib/chineseZodiac";
import { useLanguage } from "@/contexts/LanguageContext";

interface ChineseZodiacBadgeProps {
  dateOfBirth: string;
}

const ChineseZodiacBadge = ({ dateOfBirth }: ChineseZodiacBadgeProps) => {
  const { t } = useLanguage();
  const cz = getChineseZodiac(dateOfBirth);

  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <span>{cz.emoji}</span>
      <span>{t(`czodiac.${cz.animal}`)}</span>
    </span>
  );
};

export default ChineseZodiacBadge;
