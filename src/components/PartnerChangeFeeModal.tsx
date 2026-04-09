import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { purchaseSubscription } from "@/services/subscriptionService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";

interface PartnerChangeFeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  memberType?: string;
}

const PartnerChangeFeeModal = ({ open, onOpenChange, onConfirm, memberType }: PartnerChangeFeeModalProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!user) return;
    setLoading(true);
    // Mock one-time payment
    await new Promise(r => setTimeout(r, 2000));
    toast({ title: t("changeFee.success") });
    setLoading(false);
    onOpenChange(false);
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-primary/20 max-w-sm mx-auto rounded-2xl">
        <DialogHeader className="space-y-3 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
          </div>
          <DialogTitle className="font-serif text-lg text-foreground">
            {t("changeFee.title")}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t("changeFee.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <div className="rounded-xl p-3 text-center border border-amber-500/30 bg-amber-500/10">
            <span className="text-xl font-bold text-foreground">$2.99</span>
            <span className="text-sm text-muted-foreground ml-1">{t("changeFee.oneTime")}</span>
          </div>
          <Button
            onClick={handlePay}
            disabled={loading}
            className="w-full gradient-gold text-primary-foreground font-semibold"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("paywall.processing")}</>
            ) : (
              t("changeFee.confirm")
            )}
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full text-muted-foreground">
            {t("family.cancel")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PartnerChangeFeeModal;
