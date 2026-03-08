import { useState, useEffect } from "react";
import { format, parse, isValid, getDaysInMonth, addWeeks, subWeeks } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MIN_DATE = subWeeks(new Date(), 43);
const MAX_DATE = addWeeks(new Date(), 43);

const minYear = MIN_DATE.getFullYear();
const maxYear = MAX_DATE.getFullYear();
const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

interface DueDatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DueDatePicker({ value, onChange, placeholder = "Pick a date", className }: DueDatePickerProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [textValue, setTextValue] = useState(value ? format(value, "dd/MM/yyyy") : "");
  const [viewMonth, setViewMonth] = useState(value ?? new Date());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (value) setTextValue(format(value, "dd/MM/yyyy"));
  }, [value]);

  const handleTextChange = (raw: string) => {
    const cleaned = raw.replace(/[^\d/]/g, "");
    setError(null);

    // Allow clearing the field
    if (cleaned === "") {
      setTextValue("");
      onChange(undefined);
      return;
    }

    let auto = cleaned.replace(/\//g, "");
    if (auto.length >= 4) {
      auto = auto.slice(0, 2) + "/" + auto.slice(2, 4) + "/" + auto.slice(4, 8);
    } else if (auto.length >= 2) {
      auto = auto.slice(0, 2) + "/" + auto.slice(2);
    }
    setTextValue(auto);

    if (auto.length === 10) {
      const parsed = parse(auto, "dd/MM/yyyy", new Date());

      if (!isValid(parsed) || parsed < MIN_DATE || parsed > MAX_DATE) {
        setError(t("validation.invalidDueDate"));
        onChange(undefined);
        return;
      }
      setError(null);
      onChange(parsed);
      setViewMonth(parsed);
    }
  };

  const handleMonthSelect = (monthStr: string) => {
    const m = parseInt(monthStr);
    const newDate = new Date(viewMonth);
    newDate.setMonth(m);
    const maxDay = getDaysInMonth(newDate);
    if (newDate.getDate() > maxDay) newDate.setDate(maxDay);
    setViewMonth(newDate);
  };

  const handleYearSelect = (yearStr: string) => {
    const y = parseInt(yearStr);
    const newDate = new Date(viewMonth);
    newDate.setFullYear(y);
    const maxDay = getDaysInMonth(newDate);
    if (newDate.getDate() > maxDay) newDate.setDate(maxDay);
    setViewMonth(newDate);
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    setError(null);
    onChange(date);
    if (date) {
      setTextValue(format(date, "dd/MM/yyyy"));
      setViewMonth(date);
    }
    setOpen(false);
  };

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex gap-2">
        <Input
          value={textValue}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="DD/MM/YYYY"
          maxLength={10}
          className={cn(
            "flex-1 glass border-white/10 focus:border-primary",
            error && "border-destructive focus:border-destructive"
          )}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 border-border bg-muted/50 hover:bg-muted"
            >
              <CalendarIcon className="h-4 w-4 text-gold" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <div className="flex gap-2 p-3 pb-0">
              <Select value={String(viewMonth.getMonth())} onValueChange={handleMonthSelect}>
                <SelectTrigger className="h-8 text-xs flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-52">
                  {MONTHS.map((m, i) => (
                    <SelectItem key={i} value={String(i)} className="text-xs">{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={String(viewMonth.getFullYear())} onValueChange={handleYearSelect}>
                <SelectTrigger className="h-8 text-xs w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-52">
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)} className="text-xs">{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleCalendarSelect}
              month={viewMonth}
              onMonthChange={setViewMonth}
              disabled={(date) => date > MAX_DATE || date < MIN_DATE}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>
      {error && (
        <p className="text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">{error}</p>
      )}
    </div>
  );
}
