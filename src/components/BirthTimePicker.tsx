import { useState, useMemo } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/contexts/LanguageContext";

const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

interface BirthTimePickerProps {
  value: string; // "HH:MM" or ""
  onChange: (time: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  showUnknownCheckbox?: boolean;
}

export function BirthTimePicker({ value, onChange, disabled, placeholder = "HH:MM", className, showUnknownCheckbox = false }: BirthTimePickerProps) {
  const { language } = useLanguage();
  const [isUnknown, setIsUnknown] = useState(false);

  const { hour, minute } = useMemo(() => {
    const parts = value?.split(":") ?? [];
    return {
      hour: parts[0] && parts[0].length === 2 ? parts[0] : "",
      minute: parts[1] && parts[1].length === 2 ? parts[1] : "",
    };
  }, [value]);

  const setHour = (h: string) => {
    const m = minute || "00";
    onChange(`${h}:${m}`);
  };

  const setMinute = (m: string) => {
    const h = hour || "12";
    onChange(`${h}:${m}`);
  };

  const handleUnknownChange = (checked: boolean) => {
    setIsUnknown(checked);
    if (checked) {
      onChange("12:00");
    } else {
      onChange("");
    }
  };

  const selectsDisabled = disabled || isUnknown;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-2 items-center">
        <Select value={hour} onValueChange={setHour} disabled={selectsDisabled}>
          <SelectTrigger className={cn(
            "flex-1 glass border-white/10 focus:border-primary h-10",
            !hour && "text-muted-foreground",
            selectsDisabled && "opacity-50"
          )}>
            <SelectValue placeholder="HH" />
          </SelectTrigger>
          <SelectContent className="max-h-52">
            {hours.map((h) => (
              <SelectItem key={h} value={h}>{h}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className={cn("text-lg font-medium text-muted-foreground select-none", selectsDisabled && "opacity-50")}>:</span>

        <Select value={minute} onValueChange={setMinute} disabled={selectsDisabled}>
          <SelectTrigger className={cn(
            "flex-1 glass border-white/10 focus:border-primary h-10",
            !minute && "text-muted-foreground",
            selectsDisabled && "opacity-50"
          )}>
            <SelectValue placeholder="MM" />
          </SelectTrigger>
          <SelectContent className="max-h-52">
            {minutes.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="shrink-0 w-10 h-10 flex items-center justify-center rounded-md border border-border bg-muted/50">
          <Clock className="h-4 w-4 text-gold" />
        </div>
      </div>

      {showUnknownCheckbox && (
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={isUnknown}
            onCheckedChange={(checked) => handleUnknownChange(checked === true)}
          />
          <span className="text-xs text-muted-foreground">
            {language === "ka" ? "დაბადების დრო უცნობია" : "Birth time unknown"}
          </span>
        </label>
      )}
    </div>
  );
}
