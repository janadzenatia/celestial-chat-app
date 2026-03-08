import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, getEffectivePlan } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cancelSubscription } from "@/services/subscriptionService";
import { User, Star, Shield, LogOut, XCircle, Pencil, Loader2, KeyRound } from "lucide-react";
import ChineseZodiacBadge from "@/components/ChineseZodiacBadge";
import { getSunSign } from "@/lib/zodiac";
import { BirthDatePicker } from "@/components/BirthDatePicker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const ProfilePage = () => {
  const { t, language } = useLanguage();
  const { signOut, profile, user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);

  // Change password state
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast({ title: t("profile.passwordTooShort"), variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: t("profile.passwordMismatch"), variant: "destructive" });
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast({ title: error.message, variant: "destructive" });
      } else {
        toast({ title: t("profile.passwordSuccess") });
        setPasswordOpen(false);
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      toast({ title: t("auth.genericError"), variant: "destructive" });
    } finally {
      setChangingPassword(false);
    }
  };

  // Edit profile state
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDob, setEditDob] = useState<Date | undefined>();
  const [editTime, setEditTime] = useState("");
  const [editTimeUnknown, setEditTimeUnknown] = useState(false);
  const [editPlace, setEditPlace] = useState("");
  const [saving, setSaving] = useState(false);

  const effectivePlan = getEffectivePlan(profile);
  const isPremium = effectivePlan !== "free";

  const openEditModal = () => {
    setEditName(profile?.name || "");
    setEditDob(profile?.date_of_birth ? new Date(profile.date_of_birth + "T00:00:00") : undefined);
    setEditTime(profile?.time_of_birth || "");
    setEditTimeUnknown(!profile?.time_of_birth);
    setEditPlace(profile?.place_of_birth || "");
    setEditOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!user || !editDob) return;
    setSaving(true);
    const dobStr = `${editDob.getFullYear()}-${String(editDob.getMonth() + 1).padStart(2, "0")}-${String(editDob.getDate()).padStart(2, "0")}`;
    const { error } = await supabase
      .from("profiles")
      .update({
        name: editName.trim() || null,
        date_of_birth: dobStr,
        time_of_birth: editTimeUnknown ? null : (editTime || null),
        place_of_birth: editPlace.trim() || null,
      })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: t("profile.updateError"), variant: "destructive" });
    } else {
      await refreshProfile();
      toast({ title: t("profile.updateSuccess") });
      setEditOpen(false);
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await signOut();
    toast({ title: t("profile.loggedOut") });
    navigate("/auth", { replace: true });
  };

  const handleCancelSubscription = async () => {
    if (!user) return;
    setCanceling(true);
    await cancelSubscription(user.id);
    await refreshProfile();
    setCanceling(false);
    setCancelOpen(false);
    toast({ title: t("profile.cancelSuccess") });
  };

  return (
    <div className="flex flex-col">
      <AppHeader />
      <div className="px-4 py-6 space-y-5">
        {/* Profile Card */}
        <section className="glass rounded-2xl p-5 flex items-center gap-4 relative">
          <div className="w-14 h-14 rounded-full gradient-purple flex items-center justify-center">
            <User className="w-6 h-6 text-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="font-serif text-lg text-foreground">{profile?.name || "Stargazer"}</h2>
            {user?.email && (
              <p className="text-xs text-muted-foreground mb-1">{user.email}</p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Star className="w-3 h-3 text-primary" /> {isPremium ? t("profile.premium") : t("profile.free")}
              </span>
              {profile?.date_of_birth && (
                <>
                  {(() => {
                    const sun = getSunSign(profile.date_of_birth);
                    return sun ? (
                      <span className="text-xs text-muted-foreground">
                        {sun.emoji} {t(`zodiac.${sun.name}`)}
                      </span>
                    ) : null;
                  })()}
                  <ChineseZodiacBadge dateOfBirth={profile.date_of_birth} />
                </>
              )}
            </div>
          </div>
          <button
            onClick={openEditModal}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-accent/50 transition-colors"
            aria-label={t("profile.edit")}
          >
            <Pencil className="w-4 h-4 text-muted-foreground" />
          </button>
        </section>

        {/* Change Password */}
        <section className="glass rounded-2xl p-5">
          <button
            onClick={() => setPasswordOpen(true)}
            className="w-full flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors"
          >
            <KeyRound className="w-4 h-4 text-muted-foreground" />
            <span>{t("profile.changePassword")}</span>
          </button>
        {/* Settings */}
        <section className="glass rounded-2xl p-5 space-y-4">
          <h3 className="font-serif text-gradient-gold">{t("profile.settings")}</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-muted-foreground">{t("profile.language")}</span>
              <span className="text-foreground">English</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-muted-foreground">{t("profile.subscription")}</span>
              <span className="text-foreground capitalize">
                {effectivePlan === "pro_premium" 
                  ? (profile?.trial_end_date ? (language === "ka" ? "პრო (საცდელი)" : "Pro (Trial)") : "Pro Premium")
                  : effectivePlan === "basic_premium" ? "Basic Premium" 
                  : t("profile.free")}
              </span>
            </div>
          </div>
        </section>

        {/* Legal */}
        <section className="glass rounded-2xl p-5 space-y-3">
          <div className="flex items-start gap-3">
            <Shield className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("profile.legal")}
            </p>
          </div>
          <div className="flex gap-4 pl-7">
            <button onClick={() => navigate("/terms")} className="text-xs text-primary hover:underline">
              {t("legal.termsLink")}
            </button>
            <button onClick={() => navigate("/privacy")} className="text-xs text-primary hover:underline">
              {t("legal.privacyLink")}
            </button>
          </div>
        </section>

        {/* Cancel Subscription - only for premium */}
        {isPremium && (
          <button
            onClick={() => setCancelOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-destructive/20 text-destructive/70 hover:text-destructive hover:bg-destructive/5 transition-colors text-sm"
          >
            <XCircle className="w-4 h-4" />
            {t("profile.cancelSubscription")}
          </button>
        )}

        {/* Log Out */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          {t("profile.logout")}
        </button>
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent className="glass border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">{t("profile.cancelTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("profile.cancelDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={canceling}>{t("profile.keepPremium")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={canceling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {canceling ? t("profile.canceling") : t("profile.yesCancel")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Profile Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="glass border-border/50 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">{t("profile.editTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">{t("profile.name")}</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder={t("profile.name")}
                className="bg-background/50"
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">{t("profile.dob")}</Label>
              <BirthDatePicker value={editDob} onChange={setEditDob} />
            </div>

            {/* Time of Birth */}
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">{t("profile.timeOfBirth")}</Label>
              <Input
                type="time"
                value={editTimeUnknown ? "" : editTime}
                onChange={(e) => setEditTime(e.target.value)}
                disabled={editTimeUnknown}
                className="bg-background/50"
              />
              <div className="flex items-center gap-2 mt-1">
                <Checkbox
                  id="edit-time-unknown"
                  checked={editTimeUnknown}
                  onCheckedChange={(checked) => {
                    setEditTimeUnknown(!!checked);
                    if (checked) setEditTime("");
                  }}
                />
                <label htmlFor="edit-time-unknown" className="text-xs text-muted-foreground cursor-pointer">
                  {t("profile.timeUnknown")}
                </label>
              </div>
            </div>

            {/* Place of Birth */}
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">{t("profile.placeOfBirth")}</Label>
              <Input
                value={editPlace}
                onChange={(e) => setEditPlace(e.target.value)}
                placeholder={t("profile.placeOfBirthPlaceholder")}
                className="bg-background/50"
              />
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSaveProfile}
              disabled={saving || !editDob}
              className="w-full gradient-gold text-background font-semibold"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("profile.saving")}
                </span>
              ) : (
                t("profile.saveChanges")
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
