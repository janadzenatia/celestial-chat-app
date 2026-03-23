import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { sendWelcomeEmail } from "@/services/authService";
import { geocodePlace } from "@/lib/geocoding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, MapPin, AlertCircle, Check } from "lucide-react";
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

  // Geocode verification
  const [geoStatus, setGeoStatus] = useState<"idle" | "checking" | "found" | "not_found">("idle");
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lon: number; displayName: string } | null>(null);

  useEffect(() => {
    if (!place.trim() || place.trim().length < 3) {
      setGeoStatus("idle");
      setGeoCoords(null);
      return;
    }
    const timer = setTimeout(async () => {
      setGeoStatus("checking");
      const result = await geocodePlace(place.trim());
      if (result) {
        setGeoStatus("found");
        setGeoCoords(result);
      } else {
        setGeoStatus("not_found");
        setGeoCoords(null);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [place]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !dobDate) return;

    setIsLoading(true);

    // Geocode if not already done
    let birthLat: number | null = null;
    let birthLon: number | null = null;
    let birthPlaceNormalized: string | null = null;
    if (geoCoords) {
      birthLat = geoCoords.lat;
      birthLon = geoCoords.lon;
      birthPlaceNormalized = geoCoords.displayName;
    } else if (place.trim()) {
      const coords = await geocodePlace(place.trim());
      if (coords) {
        birthLat = coords.lat;
        birthLon = coords.lon;
        birthPlaceNormalized = coords.displayName;
      }
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        name,
        date_of_birth: format(dobDate, "yyyy-MM-dd"),
        time_of_birth: time || null,
        place_of_birth: place,
        onboarding_completed: true,
        birth_lat: birthLat,
        birth_lon: birthLon,
        birth_place_normalized: birthPlaceNormalized,
      } as any)
      .eq("user_id", user.id);

    setIsLoading(false);

    if (error) {
      toast({ title: t("onboarding.error"), description: error.message, variant: "destructive" });
    } else {
      await refreshProfile();
      // Send welcome email with real name and language
      const lang = localStorage.getItem("app-language") || "en";
      sendWelcomeEmail(user.email!, name, lang);
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative">
      {/* Language toggle — top right */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageToggle />
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-2xl gradient-cosmic flex items-center justify-center shadow-gold mb-4">
          <Sparkles className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="font-serif text-2xl text-gradient-gold">{t("onboarding.title")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("onboarding.subtitle")}</p>
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
            <div className="relative">
              <Input
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                required
                className="glass border-white/10 focus:border-primary pr-8"
                placeholder="Tbilisi, Georgia"
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
                {geoCoords.lat.toFixed(4)}°, {geoCoords.lon.toFixed(4)}°
              </p>
            )}
            {geoStatus === "not_found" && (
              <p className="text-[10px] text-destructive/70">
                {t("profile.cityNotFound")}
              </p>
            )}
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
