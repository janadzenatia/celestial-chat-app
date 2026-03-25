import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/PasswordInput";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Sparkles, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, Navigate } from "react-router-dom";

const AuthPage = () => {
  const { t } = useLanguage();
  const { session, profile, loading, signUp, signIn } = useAuth();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  // Redirect authenticated users away from auth page
  if (!loading && session) {
    if (profile && !profile.onboarding_completed) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/" replace />;
  }

  const getLocalizedError = (message: string): string => {
    const lower = message.toLowerCase();
    if (lower.includes("invalid login credentials") || lower.includes("invalid_credentials")) {
      return t("auth.invalidCredentials");
    }
    if (lower.includes("user not found")) {
      return t("auth.userNotFound");
    }
    return message || t("auth.genericError");
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast({ title: getLocalizedError(error.message), variant: "destructive" });
      } else {
        toast({ title: t("auth.resetSent") });
        setShowForgot(false);
      }
    } catch {
      toast({ title: t("auth.genericError"), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp && !termsAccepted) {
      toast({ title: t("auth.acceptTerms"), variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = isSignUp ? await signUp(email, password) : await signIn(email, password);
      if (error) {
        toast({ title: getLocalizedError(error.message), variant: "destructive" });
      } else if (isSignUp) {
        toast({ title: t("auth.checkEmail") });
      }
    } catch (err: any) {
      toast({ title: t("auth.genericError"), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      {/* Logo / Splash */}
      <div className="flex flex-col items-center mb-10 animate-float">
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-2xl gradient-cosmic flex items-center justify-center shadow-gold">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
          <Star className="absolute -top-2 -right-2 w-5 h-5 text-primary animate-twinkle" fill="currentColor" />
        </div>
        <h1 className="font-serif text-3xl text-gradient-gold">{t("app.name")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("app.tagline")}</p>
      </div>

      {/* Auth Form */}
      <div className="glass rounded-2xl p-6 w-full max-w-sm shadow-gold">
        {showForgot ? (
          <>
            <h2 className="font-serif text-xl text-foreground text-center mb-2">{t("auth.forgotTitle")}</h2>
            <p className="text-sm text-muted-foreground text-center mb-5">{t("auth.forgotDesc")}</p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email" className="text-muted-foreground text-sm">{t("auth.email")}</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  className="glass border-white/10 focus:border-primary"
                  placeholder="stars@astrochat.com"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full gradient-gold text-primary-foreground font-semibold h-11 rounded-xl"
              >
                {isLoading ? t("auth.loading") : t("auth.sendResetLink")}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-5">
              <button onClick={() => setShowForgot(false)} className="text-primary hover:underline font-medium">
                {t("auth.backToLogin")}
              </button>
            </p>
          </>
        ) : (
          <>
            <h2 className="font-serif text-xl text-foreground text-center mb-5">
              {isSignUp ? t("auth.signup") : t("auth.login")}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-muted-foreground text-sm">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="glass border-white/10 focus:border-primary"
                  placeholder="stars@astrochat.com"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-muted-foreground text-sm">{t("auth.password")}</Label>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => { setShowForgot(true); setForgotEmail(email); }}
                      className="text-xs text-primary hover:underline"
                    >
                      {t("auth.forgotPassword")}
                    </button>
                  )}
                </div>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="glass border-white/10 focus:border-primary"
                  placeholder="••••••••"
                />
              </div>

              {isSignUp && (
                <div className="flex items-start space-x-3 pt-1">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                    className="mt-0.5 border-primary data-[state=checked]:bg-primary"
                  />
                  <Label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                    {t("auth.terms")}
                  </Label>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || (isSignUp && !termsAccepted)}
                className="w-full gradient-gold text-primary-foreground font-semibold h-11 rounded-xl"
              >
                {isLoading ? t("auth.loading") : isSignUp ? t("auth.signup") : t("auth.login")}
              </Button>
            </form>
          </>
        )}

        {/* Google Sign-In */}
        {!showForgot && (
          <>
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">{t("auth.orContinueWith")}</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                const { error } = await lovable.auth.signInWithOAuth("google", {
                  redirect_uri: "https://astrochat.ge",
                });
                if (error) toast({ title: error.message, variant: "destructive" });
              }}
              className="w-full glass border-white/10 h-11 rounded-xl font-medium"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </Button>
          </>
        )}

        <p className="text-center text-sm text-muted-foreground mt-5">
          {isSignUp ? t("auth.alreadyHaveAccount") : t("auth.noAccount")}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary hover:underline font-medium"
          >
            {isSignUp ? t("auth.login") : t("auth.signup")}
          </button>
        </p>
      </div>

      {/* Legal footer */}
      <p className="text-xs text-muted-foreground text-center mt-6 px-4 max-w-sm leading-relaxed">
        {t("auth.legalFooter")}{" "}
        <Link to="/terms" className="text-primary hover:underline">{t("legal.termsLink")}</Link>
        {" "}{t("auth.and")}{" "}
        <Link to="/privacy" className="text-primary hover:underline">{t("legal.privacyLink")}</Link>.
      </p>
    </div>
  );
};

export default AuthPage;
