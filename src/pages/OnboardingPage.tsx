import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import LanguageToggle from "@/components/LanguageToggle";
import { BirthTimePicker } from "@/components/BirthTimePicker";
import { useToast } from "@/hooks/use-toast";
import { BirthDatePicker } from "@/components/BirthDatePicker";

const OnboardingPage = () => {
  const { t } = useLanguage();
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [dobDate, setDobDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [place, setPlace] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !dobDate) return;

    setIsLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        name,
        date_of_birth: format(dobDate, "yyyy-MM-dd"),
        time_of_birth: time || null,
        place_of_birth: place,
        onboarding_completed: true,
      })
      .eq("user_id", user.id);

    setIsLoading(false);

    if (error) {
      toast({ title: "Something went wrong", description: error.message, variant: "destructive" });
    } else {
      await refreshProfile();
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-2xl gradient-cosmic flex items-center justify-center shadow-gold mb-4">
          <Sparkles className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="font-serif text-2xl text-gradient-gold">Tell Us About You</h1>
        <p className="text-muted-foreground text-sm mt-1">So the stars can guide you ✨</p>
      </div>

      <div className="glass rounded-2xl p-6 w-full max-w-sm shadow-purple">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">{t("onboarding.name")}</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="glass border-white/10 focus:border-primary"
              placeholder="Luna Star"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">{t("onboarding.dob")}</Label>
            <BirthDatePicker value={dobDate} onChange={setDobDate} />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">{t("onboarding.time")}</Label>
            <BirthTimePicker
              value={time}
              onChange={setTime}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">{t("onboarding.place")}</Label>
            <Input
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              required
              className="glass border-white/10 focus:border-primary"
              placeholder="Tbilisi, Georgia"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || !dobDate}
            className="w-full gradient-gold text-primary-foreground font-semibold h-11 rounded-xl mt-2"
          >
            {isLoading ? "..." : t("onboarding.continue")}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingPage;
