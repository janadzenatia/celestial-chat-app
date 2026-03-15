import { useState } from "react";
import { Clock, Sparkles, Loader2, Heart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { BirthDatePicker } from "@/components/BirthDatePicker";
import { BirthTimePicker } from "@/components/BirthTimePicker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface BirthTimeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partnerName: string;
  generating: boolean;
  onSubmitWithTime: (time: string, relationshipDate?: Date) => void;
  onSkip: (relationshipDate?: Date) => void;
}

export default function BirthTimeModal({
  open,
  onOpenChange,
  partnerName,
  generating,
  onSubmitWithTime,
  onSkip,
}: BirthTimeModalProps) {
  const { t } = useLanguage();
  const [time, setTime] = useState("");
  const [unknownTime, setUnknownTime] = useState(false);
  const [relationshipDate, setRelationshipDate] = useState<Date | undefined>();

  const handleTimeChange = (val: string) => {
    const cleaned = val.replace(/[^\d:]/g, "");
    if (cleaned.length <= 5) setTime(cleaned);
  };

  const handleSubmit = () => {
    if (unknownTime || time.trim().length < 4) {
      // Use noon default — pass "12:00" so the edge function knows
      onSubmitWithTime("12:00", relationshipDate);
    } else {
      onSubmitWithTime(time, relationshipDate);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-primary/20 sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center">
            <Clock className="w-7 h-7 text-primary" />
          </div>
          <DialogTitle className="font-serif text-xl text-gradient-gold">
            {t("timeModal.title")}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            {t("timeModal.description").replace("{name}", partnerName || t("synastry.partner"))}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Birth Time */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              {t("timeModal.inputLabel")}
            </label>
            <BirthTimePicker
              value={time}
              onChange={setTime}
              disabled={unknownTime}
            />
            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="unknown-time"
                checked={unknownTime}
                onCheckedChange={(checked) => setUnknownTime(checked === true)}
              />
              <label htmlFor="unknown-time" className="text-sm text-muted-foreground cursor-pointer select-none">
                {t("timeModal.unknownTime")}
              </label>
            </div>
          </div>

          {/* Relationship Start Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Heart className="w-3.5 h-3.5 text-muted-foreground" />
              {t("compat.relationshipDate")}
            </label>
            <BirthDatePicker
              value={relationshipDate}
              onChange={setRelationshipDate}
              placeholder={t("compat.pickDate")}
            />
            <p className="text-xs text-muted-foreground">{t("timeModal.relationshipDateHint")}</p>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleSubmit}
              disabled={generating || (!unknownTime && time.length < 4)}
              className="gradient-cosmic text-foreground font-medium"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("synastry.generating")}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t("timeModal.withTime")}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
