import { useState, useEffect } from "react";
import { Puzzle, Loader2, Sparkles, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, getEffectivePlan } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getSunSign, getApproxMoonSign } from "@/lib/zodiac";
import { Button } from "@/components/ui/button";
import PaywallModal from "@/components/PaywallModal";
import { cn } from "@/lib/utils";
import { useRegenerateGuard } from "@/hooks/useRegenerateGuard";
import RegenerateConfirmDialog from "@/components/RegenerateConfirmDialog";

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

interface ChildData {
  name: string;
  date_of_birth: string;
  time_of_birth: string | null;
}

export default function MissingPieceTab() {
  const { t, language } = useLanguage();
  const { profile, user, refreshProfile } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<MissingPieceResult | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [children, setChildren] = useState<ChildData[]>([]);

  const isPremium = getEffectivePlan(profile) !== "free";

  // Refresh profile on mount to get latest partner data from DB
  useEffect(() => {
    refreshProfile();
  }, []);

  // Read partner data from profile (Supabase), not localStorage
  const partnerName = profile?.partner_name || "";
  const partnerDob = profile?.partner_birth_date || "";
  const hasPartner = Boolean(partnerDob);

  // Load children from database
  useEffect(() => {
    if (!user) return;
    const loadChildren = async () => {
      const { data } = await supabase
        .from("children")
        .select("name, date_of_birth, time_of_birth")
        .eq("user_id", user.id);
      if (data) setChildren(data);
    };
    loadChildren();
  }, [user?.id]);

  const userSun = profile?.date_of_birth ? getSunSign(profile.date_of_birth) : null;
  const userMoon = profile?.date_of_birth ? getApproxMoonSign(profile.date_of_birth) : null;
  const partnerSun = partnerDob ? getSunSign(partnerDob) : null;
  const partnerMoon = partnerDob ? getApproxMoonSign(partnerDob) : null;

  // Build children astro data for the AI
  const childrenAstroData = children.map((child) => ({
    name: child.name,
    sunSign: getSunSign(child.date_of_birth)?.name || "Unknown",
    moonSign: getApproxMoonSign(child.date_of_birth)?.name || "Unknown",
    element: getSunSign(child.date_of_birth)?.element || "Unknown",
  }));

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
          partnerName: partnerName || "",
          partnerSunSign: partnerSun.name,
          partnerMoonSign: partnerMoon?.name,
          partnerElement: partnerSun.element,
          children: childrenAstroData,
          language,
        },
      });
      if (resp.error) throw resp.error;
      setResult(resp.data as MissingPieceResult);
    } catch (e) {
      console.error("missing-piece error:", e);
      throw e;
      setGenerating(false);
    }
  };

  const { confirmOpen, requestRegenerate, confirmRegenerate, cancelRegenerate } = useRegenerateGuard(generate);

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

        {/* Show family members analyzed */}
        {children.length > 0 && (
          <div className="glass rounded-xl p-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>
              {t("family.analyzedMembers")}: {profile?.name}, {partnerName}
              {children.map((c) => `, ${c.name}`).join("")}
            </span>
          </div>
        )}

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

        <Button onClick={requestRegenerate} disabled={generating} variant="ghost" className="w-full text-muted-foreground">
          {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          {t("family.regenerate")}
        </Button>
        <RegenerateConfirmDialog open={confirmOpen} onConfirm={confirmRegenerate} onCancel={cancelRegenerate} />
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 text-center space-y-4">
      <Puzzle className="w-8 h-8 text-primary mx-auto" />
      <h3 className="font-serif text-lg text-gradient-gold">{t("family.missingPieceTitle")}</h3>
      <p className="text-sm text-muted-foreground">{t("family.missingPieceDesc")}</p>
      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground flex-wrap">
        <span>{userSun?.emoji} {profile?.name}</span>
        <span>+</span>
        <span>{partnerSun?.emoji} {partnerName}</span>
        {children.map((child, i) => {
          const childSign = getSunSign(child.date_of_birth);
          return (
            <span key={i} className="flex items-center gap-1">
              + {childSign?.emoji} {child.name}
            </span>
          );
        })}
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
