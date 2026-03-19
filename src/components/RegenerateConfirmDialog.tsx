import { useLanguage } from "@/contexts/LanguageContext";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface Props {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const RegenerateConfirmDialog = ({ open, onConfirm, onCancel }: Props) => {
  const { t } = useLanguage();

  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent className="glass border-border/50">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif">{t("regenerate.confirmTitle")}</AlertDialogTitle>
          <AlertDialogDescription>{t("regenerate.confirmDesc")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>{t("regenerate.cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="gradient-gold text-background font-semibold border-0">
            {t("regenerate.continue")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RegenerateConfirmDialog;
