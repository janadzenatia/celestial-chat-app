import { useState, useEffect } from "react";
import { CalendarDays, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCosmicCalendar, CalendarDay } from "@/hooks/useCosmicCalendar";
import { cn } from "@/lib/utils";
import PremiumBadge from "@/components/PremiumBadge";

const WEEKDAYS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKDAYS_KA = ["ორშ", "სამ", "ოთხ", "ხუთ", "პარ", "შაბ", "კვი"];
const MONTHS_EN = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTHS_KA = ["", "იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი", "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი"];

const CosmicCalendarCard = () => {
  const { t, language } = useLanguage();
  const { days, loading, generating, generate, month, year } = useCosmicCalendar();
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [showSlowMsg, setShowSlowMsg] = useState(false);

  // Show "still working" message after 8 seconds of generating
  useEffect(() => {
    if (!generating) { setShowSlowMsg(false); return; }
    const timer = setTimeout(() => setShowSlowMsg(true), 8000);
    return () => clearTimeout(timer);
  }, [generating]);

  const isWorking = loading || generating;
  const weekdays = language === "ka" ? WEEKDAYS_KA : WEEKDAYS_EN;
  const monthName = language === "ka" ? MONTHS_KA[month] : MONTHS_EN[month];

  // Calculate calendar grid
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  // Convert from Sunday=0 to Monday=0
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(year, month, 0).getDate();

  const getDayData = (day: number): CalendarDay | undefined => {
    return days.find((d) => d.day === day);
  };

  const getDotColor = (color: string) => {
    switch (color) {
      case "green": return "bg-green-400";
      case "red": return "bg-red-400";
      default: return "bg-muted-foreground/40";
    }
  };

  const getBgColor = (color: string) => {
    switch (color) {
      case "green": return "ring-green-400/30 bg-green-400/10";
      case "red": return "ring-red-400/30 bg-red-400/10";
      default: return "";
    }
  };

  const today = new Date().getDate();

  return (
    <section className="glass rounded-2xl p-5 overflow-hidden" style={{ boxShadow: "0 0 25px -5px hsl(270 50% 40% / 0.3)" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" />
          <h2 className="font-serif text-xl text-gradient-gold">{t("calendar.title")}</h2>
        </div>
        <div className="flex items-center gap-2">
          {days.length > 0 && (
            <button
              onClick={generate}
              disabled={isWorking}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${generating ? "animate-spin" : ""}`} />
            </button>
          )}
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full gradient-cosmic text-foreground flex items-center gap-1">
            <Lock className="w-3 h-3" />
            {t("cosmic.badge")}
          </span>
        </div>
      </div>

      {days.length === 0 && !isWorking ? (
        /* Empty state */
        <div className="flex flex-col items-center py-6 gap-3">
          <p className="text-sm text-muted-foreground text-center">{t("calendar.description")}</p>
          <button
            onClick={generate}
            disabled={isWorking}
            className="gradient-cosmic text-foreground font-medium text-sm px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {t("calendar.generate")}
          </button>
        </div>
      ) : isWorking && days.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground text-sm">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>{t("calendar.generating")}</span>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Month label */}
          <p className="text-center text-sm font-medium text-foreground">
            {monthName} {year}
          </p>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400" /> {t("calendar.favorable")}</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> {t("calendar.challenging")}</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted-foreground/40" /> {t("calendar.neutral")}</span>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {weekdays.map((d) => (
              <span key={d} className="text-[10px] text-muted-foreground font-medium py-1">{d}</span>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for offset */}
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const data = getDayData(dayNum);
              const isToday = dayNum === today;
              const isSelected = selectedDay?.day === dayNum;

              return (
                <button
                  key={dayNum}
                  onClick={() => data && setSelectedDay(isSelected ? null : data)}
                  className={cn(
                    "relative aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-all",
                    data ? "cursor-pointer hover:bg-muted/50" : "cursor-default",
                    isToday && "ring-1 ring-primary",
                    isSelected && "ring-2 ring-primary bg-primary/10",
                    data && getBgColor(data.color)
                  )}
                >
                  <span className={cn("text-xs", isToday ? "font-bold text-primary" : "text-foreground")}>{dayNum}</span>
                  {data && (
                    <span className={cn("w-1.5 h-1.5 rounded-full mt-0.5", getDotColor(data.color))} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Day detail popup */}
          {selectedDay && (
            <div className={cn(
              "glass rounded-xl p-3 space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-200 border",
              selectedDay.color === "green" ? "border-green-400/30" : selectedDay.color === "red" ? "border-red-400/30" : "border-border"
            )}>
              <div className="flex items-center gap-2">
                <span className={cn("w-2.5 h-2.5 rounded-full", getDotColor(selectedDay.color))} />
                <span className="text-xs font-semibold text-foreground">
                  {monthName} {selectedDay.day}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {selectedDay.color === "green" ? t("calendar.favorable") : selectedDay.color === "red" ? t("calendar.challenging") : t("calendar.neutral")}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{selectedDay.advice}</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default CosmicCalendarCard;
