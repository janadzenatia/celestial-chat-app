import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Star, Shield, LogOut, XCircle } from "lucide-react";
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
  const { t } = useLanguage();
  const { signOut, profile, user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);

  const isPremium = profile?.subscription_status === "premium" || profile?.is_premium;

  const handleLogout = async () => {
    await signOut();
    toast({ title: t("profile.loggedOut") });
    navigate("/auth", { replace: true });
  };

  const handleCancelSubscription = async () => {
    if (!user) return;
    setCanceling(true);
    await new Promise((r) => setTimeout(r, 1500));
    await supabase
      .from("profiles")
      .update({ subscription_status: "free", is_premium: false })
      .eq("user_id", user.id);
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
        <section className="glass rounded-2xl p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full gradient-purple flex items-center justify-center">
            <User className="w-6 h-6 text-foreground" />
          </div>
          <div>
            <h2 className="font-serif text-lg text-foreground">{profile?.name || "Stargazer"}</h2>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Star className="w-3 h-3 text-primary" /> {isPremium ? t("profile.premium") : t("profile.free")}
            </span>
          </div>
        </section>

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
              <span className="text-foreground">{isPremium ? t("profile.premium") : t("profile.free")}</span>
            </div>
          </div>
        </section>

        {/* Legal */}
        <section className="glass rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <Shield className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("profile.legal")}
            </p>
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
    </div>
  );
};

export default ProfilePage;
