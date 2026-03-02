import AppHeader from "@/components/AppHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { User, Star, Shield, LogOut } from "lucide-react";

const ProfilePage = () => {
  const { t } = useLanguage();
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await signOut();
    toast({ title: t("profile.loggedOut") });
    navigate("/auth", { replace: true });
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
              <Star className="w-3 h-3 text-primary" /> {profile?.subscription_status === "premium" ? t("profile.premium") : t("profile.free")}
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
              <span className="text-foreground">{profile?.subscription_status === "premium" ? t("profile.premium") : t("profile.free")}</span>
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

        {/* Log Out */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          {t("profile.logout")}
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
