import { useState } from "react";
import { Clock, Sparkles, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  onSubmitWithTime: (time: string) => void;
  onSkip: () => void;
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

  const handleTimeChange = (val: string) => {
    const cleaned = val.replace(/[^\d:]/g, "");
    if (cleaned.length <= 5) setTime(cleaned);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-primary/20 sm:max-w-md">
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              {t("timeModal.inputLabel")}
            </label>
            <Input
              value={time}
              onChange={(e) => handleTimeChange(e.target.value)}
              placeholder={t("compat.partnerTimePlaceholder")}
              maxLength={5}
              className="glass border-primary/20 focus:border-primary text-center text-lg tracking-widest"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={() => onSubmitWithTime(time)}
              disabled={generating || time.length < 4}
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
            <Button
              variant="ghost"
              onClick={onSkip}
              disabled={generating}
              className="text-muted-foreground hover:text-foreground"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("synastry.generating")}
                </>
              ) : (
                t("timeModal.skip")
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
