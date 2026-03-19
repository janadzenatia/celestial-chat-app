import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, getEffectivePlan } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cancelSubscription } from "@/services/subscriptionService";
import { User, Star, Shield, LogOut, XCircle, Pencil, Loader2, KeyRound, Trash2, ChevronRight } from "lucide-react";
import PaywallModal from "@/components/PaywallModal";
import ChineseZodiacBadge from "@/components/ChineseZodiacBadge";
import TrialBanner from "@/components/TrialBanner";
import { getSunSign } from "@/lib/zodiac";
import { BirthDatePicker } from "@/components/BirthDatePicker";
import { BirthTimePicker } from "@/components/BirthTimePicker";
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
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [langModalOpen, setLangModalOpen] = useState(false);

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
  const [discardOpen, setDiscardOpen] = useState(false);

  // Track original values for dirty check
  const [origValues, setOrigValues] = useState({ name: "", dob: "", time: "", timeUnknown: false, place: "" });

  const effectivePlan = getEffectivePlan(profile);
  const isPremium = effectivePlan !== "free";

  const openEditModal = () => {
    const name = profile?.name || "";
    const dob = profile?.date_of_birth ? new Date(profile.date_of_birth + "T00:00:00") : undefined;
    const time = profile?.time_of_birth || "";
    const timeUnknown = !profile?.time_of_birth;
    const place = profile?.place_of_birth || "";
    setEditName(name);
    setEditDob(dob);
    setEditTime(time);
    setEditTimeUnknown(timeUnknown);
    setEditPlace(place);
    setOrigValues({ name, dob: dob?.toISOString() || "", time, timeUnknown, place });
    setEditOpen(true);
  };

  const hasUnsavedChanges = () => {
    return (
      editName !== origValues.name ||
      (editDob?.toISOString() || "") !== origValues.dob ||
      editTime !== origValues.time ||
      editTimeUnknown !== origValues.timeUnknown ||
      editPlace !== origValues.place
    );
  };

  const handleEditClose = (open: boolean) => {
    if (!open && hasUnsavedChanges()) {
      setDiscardOpen(true);
      return;
    }
    setEditOpen(open);
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

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await supabase.functions.invoke("delete-account", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.error) {
        toast({ title: t("profile.deleteError"), variant: "destructive" });
      } else {
        toast({ title: t("profile.deleteSuccess") });
        await signOut();
        navigate("/auth", { replace: true });
      }
    } catch {
      toast({ title: t("profile.deleteError"), variant: "destructive" });
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <div className="flex flex-col min-h-0">
      <AppHeader />
      <div className="px-4 py-6 space-y-4 overflow-y-auto">
        {/* Trial Banner */}
        <TrialBanner />

        {/* Profile Card */}
        <section className="glass rounded-2xl p-4 flex items-center gap-3 relative min-h-[80px]">
          <div className="w-12 h-12 rounded-full gradient-purple flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-serif text-base text-foreground truncate pr-8">{profile?.name || t("profile.defaultName")}</h2>
            {user?.email && (
              <p className="text-xs text-muted-foreground mb-1 truncate">{user.email}</p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Star className="w-3 h-3 text-primary shrink-0" /> {isPremium ? t("profile.premium") : t("profile.free")}
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
            className="absolute top-3 right-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
            aria-label={t("profile.edit")}
          >
            <Pencil className="w-4 h-4 text-muted-foreground" />
          </button>
        </section>

        {/* Change Password */}
        <section className="glass rounded-2xl p-4">
          <button
            onClick={() => setPasswordOpen(true)}
            className="w-full flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors"
          >
            <KeyRound className="w-4 h-4 text-muted-foreground shrink-0" />
            <span>{t("profile.changePassword")}</span>
          </button>
        </section>

        {/* Settings */}
        <section className="glass rounded-2xl p-4 space-y-3">
          <h3 className="font-serif text-gradient-gold">{t("profile.settings")}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-muted-foreground">{t("profile.language")}</span>
              <span className="text-foreground">{t("profile.languageValue")}</span>
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
        <section className="glass rounded-2xl p-4 space-y-3 min-h-[80px]">
          <div className="flex items-start gap-3">
            <Shield className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed break-words">
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

        {/* Action Buttons */}
        <div className="space-y-3 pb-4">
          {/* Cancel Subscription - only for premium */}
          {isPremium && (
            <button
              onClick={() => setCancelOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-destructive/20 text-destructive/70 hover:text-destructive hover:bg-destructive/5 transition-colors text-sm"
            >
              <XCircle className="w-4 h-4 shrink-0" />
              {t("profile.cancelSubscription")}
            </button>
          )}

          {/* Delete Account */}
          <button
            onClick={() => setDeleteOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-destructive/20 text-destructive/60 hover:text-destructive hover:bg-destructive/5 transition-colors text-xs"
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" />
            {t("profile.deleteAccount")}
          </button>

          {/* Log Out */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {t("profile.logout")}
          </button>
        </div>
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
      <Dialog open={editOpen} onOpenChange={handleEditClose}>
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
              <BirthTimePicker
                value={editTimeUnknown ? "" : editTime}
                onChange={setEditTime}
                disabled={editTimeUnknown}
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

      {/* Change Password Dialog */}
      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent className="glass border-border/50 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">{t("profile.changePassword")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">{t("profile.newPassword")}</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">{t("profile.confirmNewPassword")}</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                className="bg-background/50"
              />
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={changingPassword || !newPassword}
              className="w-full gradient-gold text-background font-semibold"
            >
              {changingPassword ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("profile.updatingPassword")}
                </span>
              ) : (
                t("profile.updatePassword")
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="glass border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">{t("profile.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("profile.deleteDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t("profile.deleteCancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? t("profile.deleting") : t("profile.deleteConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Discard Changes Confirmation */}
      <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialogContent className="glass border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">{t("profile.discardTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("profile.discardDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("profile.discardContinue")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setDiscardOpen(false);
                setEditOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("profile.discardClose")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProfilePage;
