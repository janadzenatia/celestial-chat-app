import { useState } from "react";
import { Heart, Pencil, Trash2, Sparkles, Loader2, Lock, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getSunSign, ZodiacSign } from "@/lib/zodiac";
import { format, parse } from "date-fns";
import { BirthDatePicker } from "@/components/BirthDatePicker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PaywallModal from "@/components/PaywallModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface PartnerCardProps {
  onPartnerChange: () => void;
  onDeepSynastry: (partnerName: string, partnerDob: string) => void;
}

const PartnerCard = ({ onPartnerChange, onDeepSynastry }: PartnerCardProps) => {
  const { t, language } = useLanguage();
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [dob, setDob] = useState<Date | undefined>();
  const [saving, setSaving] = useState(false);
  const [generatingLove, setGeneratingLove] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);

  const partnerName = profile?.partner_name as string | undefined;
  const partnerDob = profile?.partner_birth_date as string | undefined;
  const partnerLoveLanguage = profile?.partner_love_language as string | undefined;

  const partnerSign = partnerDob ? getSunSign(partnerDob) : null;

  const openAddForm = () => {
    setName("");
    setDob(undefined);
    setEditMode(false);
    setFormOpen(true);
  };

  const openEditForm = () => {
    setName(partnerName || "");
    setDob(partnerDob ? parse(partnerDob, "yyyy-MM-dd", new Date()) : undefined);
    setEditMode(true);
    setFormOpen(true);
  };

  const generateLoveLanguage = async (pName: string, sign: ZodiacSign) => {
    if (!user) return;
    setGeneratingLove(true);
    try {
      const resp = await supabase.functions.invoke("partner-love-language", {
        body: {
          partnerName: pName,
          partnerSign: sign.name,
          partnerElement: sign.element,
          language,
        },
      });
      if (resp.error) throw resp.error;
      const summary = resp.data?.summary || "";
      await supabase
        .from("profiles")
        .update({ partner_love_language: summary } as any)
        .eq("user_id", user.id);
      await refreshProfile();
    } catch (e) {
      console.error("Love language generation failed:", e);
    } finally {
      setGeneratingLove(false);
    }
  };

  const handleSave = async () => {
    if (!user || !name.trim() || !dob) return;
    setSaving(true);
    const dobStr = format(dob, "yyyy-MM-dd");
    const sign = getSunSign(dobStr);

    const { error } = await supabase
      .from("profiles")
      .update({
        partner_name: name.trim(),
        partner_birth_date: dobStr,
        partner_love_language: null,
      } as any)
      .eq("user_id", user.id);

    if (error) {
      toast({ title: t("auth.genericError"), variant: "destructive" });
    } else {
      await refreshProfile();
      setFormOpen(false);
      onPartnerChange();
      // Auto-generate love language
      if (sign) {
        generateLoveLanguage(name.trim(), sign);
      }
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!user) return;
    await supabase
      .from("profiles")
      .update({
        partner_name: null,
        partner_birth_date: null,
        partner_love_language: null,
      } as any)
      .eq("user_id", user.id);
    await refreshProfile();
    onPartnerChange();
  };

  const isPremium = profile?.subscription_status === "premium" || profile?.is_premium;

  const handleDeepSynastry = () => {
    if (!isPremium) {
      setPaywallOpen(true);
      return;
    }
    if (partnerName && partnerDob) {
      onDeepSynastry(partnerName, partnerDob);
    }
  };

  // Empty state
  if (!partnerName || !partnerDob) {
    return (
      <>
        <button
          onClick={openAddForm}
          className="w-full glass rounded-2xl p-8 border border-dashed border-primary/30 flex flex-col items-center gap-3 hover:border-primary/60 transition-colors cursor-pointer"
        >
          <div className="w-14 h-14 rounded-full gradient-gold flex items-center justify-center">
            <Plus className="w-7 h-7 text-primary-foreground" />
          </div>
          <span className="font-serif text-lg text-gradient-gold">{t("partner.add")}</span>
          <span className="text-xs text-muted-foreground">{t("partner.addDesc")}</span>
        </button>

        <PartnerFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          name={name}
          setName={setName}
          dob={dob}
          setDob={setDob}
          saving={saving}
          onSave={handleSave}
          editMode={editMode}
        />
      </>
    );
  }

  // Populated state
  return (
    <>
      <div className="glass rounded-2xl overflow-hidden">
        {/* Partner header */}
        <div className="gradient-cosmic p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-3xl">
            {partnerSign?.emoji || "💫"}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-lg text-foreground truncate">{partnerName}</h3>
            {partnerSign && (
              <p className="text-sm text-muted-foreground">
                {t(`zodiac.${partnerSign.name}`)} · {t(`element.${partnerSign.element}`)}
              </p>
            )}
          </div>
          <div className="flex gap-1.5">
            <button onClick={openEditForm} className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <Pencil className="w-4 h-4 text-muted-foreground" />
            </button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass border-primary/20">
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("partner.deleteTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>{t("partner.deleteDesc")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("family.cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                    {t("partner.deleteConfirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Love language section - FREE for all */}
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-400" />
            <h4 className="text-sm font-semibold text-foreground">{t("partner.loveLanguage")}</h4>
          </div>
          {generatingLove ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("partner.generatingLove")}
            </div>
          ) : partnerLoveLanguage ? (
            <p className="text-sm text-muted-foreground leading-relaxed">{partnerLoveLanguage}</p>
          ) : (
            <p className="text-xs text-muted-foreground italic">{t("partner.noLoveLanguage")}</p>
          )}
        </div>

        {/* Deep Synastry CTA */}
        <div className="px-5 pb-5">
          <button
            onClick={handleDeepSynastry}
            className={cn(
              "w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-opacity",
              isPremium
                ? "gradient-gold text-primary-foreground hover:opacity-90"
                : "bg-muted/50 border border-primary/20 text-foreground hover:bg-muted"
            )}
          >
            {isPremium ? (
              <>
                <Sparkles className="w-4 h-4" />
                {t("partner.deepSynastry")}
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-primary" />
                {t("partner.deepSynastry")}
              </>
            )}
          </button>
        </div>
      </div>

      <PartnerFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        name={name}
        setName={setName}
        dob={dob}
        setDob={setDob}
        saving={saving}
        onSave={handleSave}
        editMode={editMode}
      />
      <PaywallModal open={paywallOpen} onOpenChange={setPaywallOpen} />
    </>
  );
};

// --- Sub-component: Form Dialog ---
interface PartnerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  setName: (n: string) => void;
  dob: Date | undefined;
  setDob: (d: Date | undefined) => void;
  saving: boolean;
  onSave: () => void;
  editMode: boolean;
}

const PartnerFormDialog = ({
  open, onOpenChange, name, setName, dob, setDob, saving, onSave, editMode,
}: PartnerFormDialogProps) => {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-primary/20 max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-gradient-gold">
            {editMode ? t("partner.edit") : t("partner.add")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("compat.partnerName")}</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("compat.partnerNamePlaceholder")}
              className="glass border-white/10 focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("compat.partnerDob")}</label>
            <BirthDatePicker value={dob} onChange={setDob} placeholder={t("compat.pickDate")} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              {t("family.cancel")}
            </Button>
            <Button
              className="flex-1 gradient-gold text-primary-foreground"
              disabled={!name.trim() || !dob || saving}
              onClick={onSave}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t("family.save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PartnerCard;
