import { useState, useEffect, useCallback } from "react";
import AppHeader from "@/components/AppHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, getEffectivePlan } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cancelSubscription } from "@/services/subscriptionService";
import { geocodePlace } from "@/lib/geocoding";
import { User, Star, Shield, LogOut, XCircle, Pencil, Loader2, KeyRound, Trash2, ChevronRight, Check, MapPin, AlertCircle } from "lucide-react";
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
  const { t, language, setLanguage } = useLanguage();
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

  // Geocode verification state
  const [geoStatus, setGeoStatus] = useState<"idle" | "checking" | "found" | "not_found">("idle");
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lon: number; displayName: string } | null>(null);

  // Track original values for dirty check
  const [origValues, setOrigValues] = useState({ name: "", dob: "", time: "", timeUnknown: false, place: "" });

  // Debounced geocode check when place changes
  useEffect(() => {
    if (!editPlace.trim() || editPlace.trim().length < 3) {
      setGeoStatus("idle");
      setGeoCoords(null);
      return;
    }
    const timer = setTimeout(async () => {
      setGeoStatus("checking");
      const result = await geocodePlace(editPlace.trim());
      if (result) {
        setGeoStatus("found");
        setGeoCoords(result);
      } else {
        setGeoStatus("not_found");
        setGeoCoords(null);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [editPlace]);

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

    // Detect if birth time changed
    const oldTime = origValues.time;
    const newTime = editTimeUnknown ? "" : editTime;
    const birthTimeChanged = oldTime !== newTime || editTimeUnknown !== origValues.timeUnknown;

    // Use already-verified geocode result, or fetch fresh
    let birthLat: number | null = null;
    let birthLon: number | null = null;
    let birthPlaceNormalized: string | null = null;
    const placeStr = editPlace.trim();
    if (placeStr && geoCoords) {
      birthLat = geoCoords.lat;
      birthLon = geoCoords.lon;
      birthPlaceNormalized = geoCoords.displayName;
    } else if (placeStr) {
      const coords = await geocodePlace(placeStr);
      if (coords) {
        birthLat = coords.lat;
        birthLon = coords.lon;
        birthPlaceNormalized = coords.displayName;
      }
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        name: editName.trim() || null,
        date_of_birth: dobStr,
        time_of_birth: editTimeUnknown ? null : (editTime || null),
        place_of_birth: placeStr || null,
        birth_lat: birthLat,
        birth_lon: birthLon,
        birth_place_normalized: birthPlaceNormalized,
        // Clear cached Big 3 so they get recalculated
        cached_sun_sign: null,
        cached_moon_sign: null,
        cached_rising_sign: null,
        cached_sun_emoji: null,
        cached_moon_emoji: null,
        cached_rising_emoji: null,
      } as any)
      .eq("user_id", user.id);

    if (error) {
      toast({ title: t("profile.updateError"), variant: "destructive" });
    } else {
      // Invalidate all cached cosmic data for this user
      // 1. Clear localStorage caches (Big 3 detail, blueprint, etc.)
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith(`blueprint_${user.id}`) ||
          key.startsWith(`big3_`) ||
          key.startsWith(`insight_${user.id}`) ||
          key.startsWith(`cosmic_`) ||
          key.startsWith(`wealth_`) ||
          key.startsWith(`match_`) ||
          key.startsWith(`synastry_`) ||
          key.startsWith(`hook_`)
        )) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));

      // 2. Delete stale DB-cached data (daily insights, cosmic hooks)
      await Promise.all([
        supabase.from("daily_insights").delete().eq("user_id", user.id),
        supabase.from("cosmic_hooks").delete().eq("user_id", user.id),
        supabase.from("cosmic_matches").delete().eq("user_id", user.id),
      ]);

      await refreshProfile();

      // Show birth-time-specific note
      if (birthTimeChanged) {
        toast({
          title: t("profile.updateSuccessCosmic"),
          description: t("profile.birthTimeNote"),
        });
      } else {
        toast({ title: t("profile.updateSuccessCosmic") });
      }
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
    const result = await cancelSubscription(user.id);
    if (result.success) {
      // Cancellation email is now sent server-side by the manage-subscription function
    }
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
            <button
              onClick={() => setLangModalOpen(true)}
              className="w-full flex justify-between items-center py-2 border-b border-white/5 active:bg-accent/20 transition-colors rounded-md px-1 -mx-1"
            >
              <span className="text-muted-foreground">{t("profile.language")}</span>
              <span className="flex items-center gap-1 text-foreground">
                {t("profile.languageValue")}
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </span>
            </button>
            <button
              onClick={() => setPaywallOpen(true)}
              className="w-full flex justify-between items-center py-2 border-b border-white/5 active:bg-accent/20 transition-colors rounded-md px-1 -mx-1"
            >
              <span className="text-muted-foreground">{t("profile.subscription")}</span>
              <span className="flex items-center gap-1 text-foreground capitalize">
                {effectivePlan === "premium"
                  ? (language === "ka" ? "პრემიუმი აქტიურია ✓" : "Premium Active ✓")
                  : profile?.trial_end_date && new Date(profile.trial_end_date) > new Date()
                    ? (language === "ka"
                      ? `უფასო საცდელი — ${Math.ceil((new Date(profile.trial_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} დღე დარჩა`
                      : `Free Trial — ${Math.ceil((new Date(profile.trial_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining`)
                    : t("profile.free")}
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </span>
            </button>
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
            <AlertDialogTitle className="font-serif">
              {language === "ka" ? "გააუქმო $2.99/თვიანი გამოწერა?" : "Cancel your $2.99/month subscription?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === "ka"
                ? "ნამდვილად გსურს გაუქმება? დაკარგავ წვდომას ყველა პრემიუმ ფუნქციაზე."
                : "Are you sure? You'll lose access to all premium features."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={canceling}
              className="bg-destructive/80 text-destructive-foreground hover:bg-destructive border-0"
            >
              {canceling ? t("profile.canceling") : t("profile.yesCancel")}
            </AlertDialogAction>
            <AlertDialogCancel disabled={canceling} className="gradient-gold text-background font-semibold border-0 hover:opacity-90">
              {t("profile.keepPremium")}
            </AlertDialogCancel>
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
              <div className="relative">
                <Input
                  value={editPlace}
                  onChange={(e) => setEditPlace(e.target.value)}
                  placeholder={t("profile.placeOfBirthPlaceholder")}
                  className="bg-background/50 pr-8"
                />
                {geoStatus === "checking" && (
                  <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
                )}
                {geoStatus === "found" && (
                  <MapPin className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
                )}
                {geoStatus === "not_found" && (
                  <AlertCircle className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-destructive/70" />
                )}
              </div>
              {geoStatus === "found" && geoCoords && (
                <p className="text-[10px] text-green-400/80 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  {geoCoords.lat.toFixed(4)}°N, {geoCoords.lon.toFixed(4)}°E
                </p>
              )}
              {geoStatus === "not_found" && (
                <p className="text-[10px] text-destructive/70">
                  {t("profile.cityNotFound")}
                </p>
              )}
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

      {/* Language Selection Modal */}
      <Dialog open={langModalOpen} onOpenChange={setLangModalOpen}>
        <DialogContent className="glass border-border/50 max-w-xs">
          <DialogHeader>
            <DialogTitle className="font-serif">{t("profile.language")}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 pt-2">
            {([["en", "English"], ["ka", "ქართული"]] as const).map(([code, label]) => (
              <button
                key={code}
                onClick={() => {
                  setLanguage(code);
                  if (user) {
                    supabase.from("profiles").update({ language_preference: code }).eq("user_id", user.id);
                  }
                  setLangModalOpen(false);
                }}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                  language === code
                    ? "gradient-gold text-primary-foreground font-semibold"
                    : "bg-background/50 text-foreground hover:bg-accent/30"
                }`}
              >
                <span>{label}</span>
                {language === code && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Paywall Modal */}
      <PaywallModal open={paywallOpen} onOpenChange={setPaywallOpen} />
    </div>
  );
};

export default ProfilePage;
