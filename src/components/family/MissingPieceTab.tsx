import { useState } from "react";
import { Puzzle, Loader2, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getSunSign, getApproxMoonSign } from "@/lib/zodiac";
import { Button } from "@/components/ui/button";
import PaywallModal from "@/components/PaywallModal";
import { cn } from "@/lib/utils";

interface SuggestedSign {
  sign: string;
  emoji: string;
  element: string;
  reasoning: string;
}

interface MissingPieceResult {
  signs: SuggestedSign[];
  summary: string;
}

export default function MissingPieceTab() {
  const { t, language } = useLanguage();
  const { profile } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<MissingPieceResult | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);

  const isPremium = profile?.subscription_status === "premium" || profile?.is_premium;

  // Read saved partner data from localStorage
  const getSavedPartner = () => {
    try {
      const raw = localStorage.getItem("astrochat_compat_form");
      if (!raw) return null;
      const d = JSON.parse(raw);
      return d.partnerDate ? { name: d.partnerName, dob: d.partnerDate } : null;
    } catch { return null; }
  };

  const partner = getSavedPartner();
  const hasPartner = Boolean(partner?.dob);

  const userSun = profile?.date_of_birth ? getSunSign(profile.date_of_birth) : null;
  const userMoon = profile?.date_of_birth ? getApproxMoonSign(profile.date_of_birth) : null;
  const partnerSun = partner?.dob ? getSunSign(partner.dob) : null;
  const partnerMoon = partner?.dob ? getApproxMoonSign(partner.dob) : null;

  const generate = async () => {
    if (!userSun || !partnerSun) return;
    setGenerating(true);
    try {
      const resp = await supabase.functions.invoke("missing-piece", {
        body: {
          userName: profile?.name,
          userSunSign: userSun.name,
          userMoonSign: userMoon?.name,
          userElement: userSun.element,
          partnerName: partner?.name || "",
          partnerSunSign: partnerSun.name,
          partnerMoonSign: partnerMoon?.name,
          partnerElement: partnerSun.element,
          language,
        },
      });
      if (resp.error) throw resp.error;
      setResult(resp.data as MissingPieceResult);
    } catch (e) {
      console.error("missing-piece error:", e);
    } finally {
      setGenerating(false);
    }
  };

  if (!hasPartner) {
    return (
      <div className="glass rounded-2xl p-6 text-center space-y-3">
        <Puzzle className="w-8 h-8 text-primary mx-auto" />
        <h3 className="font-serif text-lg text-gradient-gold">{t("family.missingPieceTitle")}</h3>
        <p className="text-sm text-muted-foreground">{t("family.needPartnerData")}</p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="glass rounded-2xl p-5 text-center space-y-2">
          <Puzzle className="w-6 h-6 text-primary mx-auto" />
          <h3 className="font-serif text-lg text-gradient-gold">{t("family.missingPieceTitle")}</h3>
          <p className="text-sm text-muted-foreground italic leading-relaxed">{result.summary}</p>
        </div>

        {result.signs.map((s, i) => (
          <div key={i} className="glass rounded-2xl p-5 space-y-3 bg-gradient-to-br from-primary/10 to-secondary/10">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{s.emoji}</span>
              <div>
                <h4 className="font-serif text-base text-foreground">{t(`zodiac.${s.sign}`) || s.sign}</h4>
                <span className="text-xs text-muted-foreground">{t(`element.${s.element}`) || s.element}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.reasoning}</p>
          </div>
        ))}

        <Button onClick={generate} disabled={generating} variant="ghost" className="w-full text-muted-foreground">
          {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          {t("family.regenerate")}
        </Button>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 text-center space-y-4">
      <Puzzle className="w-8 h-8 text-primary mx-auto" />
      <h3 className="font-serif text-lg text-gradient-gold">{t("family.missingPieceTitle")}</h3>
      <p className="text-sm text-muted-foreground">{t("family.missingPieceDesc")}</p>
      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
        <span>{userSun?.emoji} {profile?.name}</span>
        <span>+</span>
        <span>{partnerSun?.emoji} {partner?.name}</span>
      </div>
      <Button
        onClick={() => {
          if (!isPremium) { setPaywallOpen(true); return; }
          generate();
        }}
        disabled={generating}
        className="gradient-cosmic text-foreground font-medium px-6"
      >
        {generating ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("family.analyzing")}</>
        ) : (
          <><Sparkles className="w-4 h-4 mr-2" />{t("family.findMissingPiece")}</>
        )}
      </Button>

      <PaywallModal open={paywallOpen} onOpenChange={setPaywallOpen} />
    </div>
  );
}
