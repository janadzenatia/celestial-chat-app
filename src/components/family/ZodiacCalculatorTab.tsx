import { useState } from "react";
import { Calculator, Loader2, Sparkles, Baby, XCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, getEffectivePlan } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getSunSign } from "@/lib/zodiac";
import { DueDatePicker } from "@/components/DueDatePicker";
import { Button } from "@/components/ui/button";
import PaywallModal from "@/components/PaywallModal";
import { cn } from "@/lib/utils";

const ZODIAC_SIGNS = [
  { name: "Aries", emoji: "♈", start: "03-21", end: "04-19" },
  { name: "Taurus", emoji: "♉", start: "04-20", end: "05-20" },
  { name: "Gemini", emoji: "♊", start: "05-21", end: "06-20" },
  { name: "Cancer", emoji: "♋", start: "06-21", end: "07-22" },
  { name: "Leo", emoji: "♌", start: "07-23", end: "08-22" },
  { name: "Virgo", emoji: "♍", start: "08-23", end: "09-22" },
  { name: "Libra", emoji: "♎", start: "09-23", end: "10-22" },
  { name: "Scorpio", emoji: "♏", start: "10-23", end: "11-21" },
  { name: "Sagittarius", emoji: "♐", start: "11-22", end: "12-21" },
  { name: "Capricorn", emoji: "♑", start: "12-22", end: "01-19" },
  { name: "Aquarius", emoji: "♒", start: "01-20", end: "02-18" },
  { name: "Pisces", emoji: "♓", start: "02-19", end: "03-20" },
];

function getConceptionWindow(signName: string, language: string): { from: string; to: string } {
  const sign = ZODIAC_SIGNS.find(z => z.name === signName);
  if (!sign) return { from: "", to: "" };

  const now = new Date();
  const currentYear = now.getFullYear();

  for (let yearOffset = 0; yearOffset <= 2; yearOffset++) {
    const year = currentYear + yearOffset;
    let birthStart = new Date(`${year}-${sign.start}`);
    let birthEnd = new Date(`${year}-${sign.end}`);
    if (birthEnd < birthStart) birthEnd.setFullYear(year + 1);

    const conceptionStart = new Date(birthStart);
    conceptionStart.setDate(conceptionStart.getDate() - 280);
    const conceptionEnd = new Date(birthEnd);
    conceptionEnd.setDate(conceptionEnd.getDate() - 280);

    if (conceptionEnd >= now) {
      const locale = language === "ka" ? "ka-GE" : "en-US";
      return {
        from: conceptionStart.toLocaleDateString(locale, { month: "long", day: "numeric", year: "numeric" }),
        to: conceptionEnd.toLocaleDateString(locale, { month: "long", day: "numeric", year: "numeric" }),
      };
    }
  }

  const year = currentYear + 2;
  let birthStart = new Date(`${year}-${sign.start}`);
  let birthEnd = new Date(`${year}-${sign.end}`);
  if (birthEnd < birthStart) birthEnd.setFullYear(year + 1);
  const conceptionStart = new Date(birthStart);
  conceptionStart.setDate(conceptionStart.getDate() - 280);
  const conceptionEnd = new Date(birthEnd);
  conceptionEnd.setDate(conceptionEnd.getDate() - 280);
  const locale = language === "ka" ? "ka-GE" : "en-US";
  return {
    from: conceptionStart.toLocaleDateString(locale, { month: "long", day: "numeric", year: "numeric" }),
    to: conceptionEnd.toLocaleDateString(locale, { month: "long", day: "numeric", year: "numeric" }),
  };
}

export default function ZodiacCalculatorTab() {
  const { t, language } = useLanguage();
  const { user, profile } = useAuth();
  const [mode, setMode] = useState<"plan" | "expecting">("plan");
  const [paywallOpen, setPaywallOpen] = useState(false);

  // Plan mode
  const [selectedSign, setSelectedSign] = useState<string | null>(null);

  // Expecting mode
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [babySummary, setBabySummary] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const isPremium = getEffectivePlan(profile) === "premium";

  const conceptionWindow = selectedSign ? getConceptionWindow(selectedSign, language) : null;
  const babySign = dueDate ? getSunSign(dueDate.toISOString().split("T")[0]) : null;

  const handleClear = () => {
    setDueDate(undefined);
    setBabySummary(null);
    setGenerating(false);
  };

  const generateBabySummary = async () => {
    if (!isPremium) {
      setPaywallOpen(true);
      return;
    }
    if (!babySign) return;
    setGenerating(true);
    try {
      const resp = await supabase.functions.invoke("baby-personality", {
        body: { zodiacSign: babySign.name, language },
      });
      if (resp.error) throw resp.error;
      setBabySummary((resp.data as any).summary);
    } catch (e) {
      console.error("baby-personality error:", e);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="glass rounded-xl p-1 flex">
        <button
          onClick={() => { setMode("plan"); setBabySummary(null); setGenerating(false); }}
          className={cn(
            "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all",
            mode === "plan" ? "gradient-cosmic text-foreground" : "text-muted-foreground"
          )}
        >
          {t("family.planSign")}
        </button>
        <button
          onClick={() => { setMode("expecting"); setSelectedSign(null); setGenerating(false); }}
          className={cn(
            "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all",
            mode === "expecting" ? "gradient-cosmic text-foreground" : "text-muted-foreground"
          )}
        >
          {t("family.expecting")}
        </button>
      </div>

      {mode === "plan" ? (
        <div className="glass rounded-2xl p-5 space-y-4">
          <div className="text-center space-y-1">
            <Calculator className="w-6 h-6 text-primary mx-auto" />
            <h3 className="font-serif text-base text-gradient-gold">{t("family.planSignTitle")}</h3>
            <p className="text-xs text-muted-foreground">{t("family.planSignDesc")}</p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {ZODIAC_SIGNS.map(z => (
              <button
                key={z.name}
                onClick={() => setSelectedSign(z.name)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-xl transition-all text-xs",
                  selectedSign === z.name
                    ? "gradient-cosmic text-foreground shadow-lg"
                    : "glass hover:bg-white/10 text-muted-foreground"
                )}
              >
                <span className="text-lg">{z.emoji}</span>
                <span className="font-medium">{t(`zodiac.${z.name}`)}</span>
              </button>
            ))}
          </div>

          {conceptionWindow && selectedSign && (
            <div className="rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 p-4 space-y-2 animate-in fade-in duration-300">
              <h4 className="font-serif text-sm text-foreground text-center">{t("family.conceptionWindow")}</h4>
              <p className="text-center text-sm text-primary font-semibold">
                {conceptionWindow.from} — {conceptionWindow.to}
              </p>
              <p className="text-xs text-muted-foreground text-center">{t("family.conceptionNote")}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="glass rounded-2xl p-5 space-y-4">
          <div className="text-center space-y-1">
            <Baby className="w-6 h-6 text-primary mx-auto" />
            <h3 className="font-serif text-base text-gradient-gold">{t("family.expectingTitle")}</h3>
            <p className="text-xs text-muted-foreground">{t("family.expectingDesc")}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("family.dueDate")}</label>
            <DueDatePicker
              value={dueDate}
              onChange={(d) => { setDueDate(d); setBabySummary(null); }}
              placeholder={t("compat.pickDate")}
            />
            {dueDate && (
              <button
                onClick={handleClear}
                className="flex items-center gap-1 text-xs text-destructive/70 hover:text-destructive transition-colors mt-1"
              >
                <XCircle className="w-3.5 h-3.5" />
                {language === "ka" ? "გასუფთავება" : "Clear date"}
              </button>
            )}
          </div>

          {babySign && (
            <div className="rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 p-4 text-center space-y-2 animate-in fade-in duration-300">
              <span className="text-4xl">{babySign.emoji}</span>
              <h4 className="font-serif text-lg text-foreground">{t(`zodiac.${babySign.name}`)}</h4>
              <p className="text-xs text-muted-foreground">{t(`element.${babySign.element}`)}</p>

              {babySummary ? (
                <p className="text-sm text-muted-foreground leading-relaxed italic pt-2">{babySummary}</p>
              ) : (
                <Button
                  onClick={generateBabySummary}
                  disabled={generating}
                  className="gradient-cosmic text-foreground font-medium mt-2"
                >
                  {generating ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("family.analyzing")}</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2" />{t("family.revealPersonality")}</>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      <PaywallModal open={paywallOpen} onOpenChange={setPaywallOpen} />
    </div>
  );
}
