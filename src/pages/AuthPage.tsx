import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Sparkles, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AuthPage = () => {
  const { t } = useLanguage();
  const { signUp, signIn } = useAuth();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp && !termsAccepted) {
      toast({ title: "Please accept the Terms & Conditions", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    const { error } = isSignUp ? await signUp(email, password) : await signIn(email, password);
    setIsLoading(false);

    if (error) {
      toast({ title: error.message, variant: "destructive" });
    } else if (isSignUp) {
      toast({ title: "Check your email to verify your account! ✨" });
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
            <Label htmlFor="password" className="text-muted-foreground text-sm">{t("auth.password")}</Label>
            <Input
              id="password"
              type="password"
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
            {isLoading ? "..." : isSignUp ? t("auth.signup") : t("auth.login")}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-5">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary hover:underline font-medium"
          >
            {isSignUp ? t("auth.login") : t("auth.signup")}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
