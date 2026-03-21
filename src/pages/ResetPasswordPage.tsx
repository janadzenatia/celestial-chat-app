import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import PasswordInput from "@/components/PasswordInput";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Sparkles, KeyRound } from "lucide-react";

const ResetPasswordPage = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: t("reset.mismatch"), variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: t("reset.tooShort"), variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast({ title: error.message, variant: "destructive" });
      } else {
        toast({ title: t("reset.success") });
        navigate("/");
      }
    } catch {
      toast({ title: t("auth.genericError"), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isRecovery) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="glass rounded-2xl p-6 w-full max-w-sm shadow-gold text-center">
          <KeyRound className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="font-serif text-xl text-foreground mb-2">{t("reset.invalidLink")}</h2>
          <p className="text-sm text-muted-foreground mb-4">{t("reset.invalidLinkDesc")}</p>
          <Button onClick={() => navigate("/auth")} className="w-full gradient-gold text-primary-foreground font-semibold h-11 rounded-xl">
            {t("auth.login")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 rounded-2xl gradient-cosmic flex items-center justify-center shadow-gold mb-4">
          <Sparkles className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="font-serif text-2xl text-gradient-gold">{t("reset.title")}</h1>
      </div>

      <div className="glass rounded-2xl p-6 w-full max-w-sm shadow-gold">
        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-muted-foreground text-sm">{t("reset.newPassword")}</Label>
            <Input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="glass border-white/10 focus:border-primary"
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-muted-foreground text-sm">{t("reset.confirmPassword")}</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="glass border-white/10 focus:border-primary"
              placeholder="••••••••"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full gradient-gold text-primary-foreground font-semibold h-11 rounded-xl"
          >
            {isLoading ? t("auth.loading") : t("reset.submit")}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
