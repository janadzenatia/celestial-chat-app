import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Sun, Moon, Sunrise, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface Big3DetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "sun" | "moon" | "rising" | null;
  signName: string;
  signEmoji: string;
}

const CACHE_KEY = "big3_detail_cache";

const Big3DetailSheet = ({ open, onOpenChange, type, signName, signEmoji }: Big3DetailSheetProps) => {
  const { profile } = useAuth();
  const { language } = useLanguage();
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const titles: Record<string, Record<string, string>> = {
    sun: { ka: "შენი მზის ნიშანი", en: "Your Sun Sign" },
    moon: { ka: "შენი მთვარის ნიშანი", en: "Your Moon Sign" },
    rising: { ka: "შენი ასცენდენტი", en: "Your Ascendant / Rising" },
  };

  const icons: Record<string, typeof Sun> = { sun: Sun, moon: Moon, rising: Sunrise };

  useEffect(() => {
    if (!open || !type || !signName) return;

    // Check localStorage cache
    const cacheKey = `${CACHE_KEY}_${type}_${signName}_${language}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setContent(cached);
      return;
    }

    fetchDetail();
  }, [open, type, signName, language]);

  const fetchDetail = async () => {
    if (!type || !profile?.date_of_birth) return;
    setLoading(true);
    setContent(null);

    try {
      const resp = await supabase.functions.invoke("big3-detail", {
        body: {
          type: type === "rising" ? "rising" : type,
          signName,
          signEmoji,
          userName: profile.name,
          dateOfBirth: profile.date_of_birth,
          timeOfBirth: profile.time_of_birth,
          language,
        },
      });

      if (resp.error) throw resp.error;
      const text = resp.data?.content || "";
      setContent(text);

      // Cache
      const cacheKey = `${CACHE_KEY}_${type}_${signName}_${language}`;
      localStorage.setItem(cacheKey, text);
    } catch (e) {
      console.error("Failed to fetch Big 3 detail:", e);
      setContent(language === "ka" ? "შეცდომა. სცადე მოგვიანებით." : "Something went wrong. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (!type) return null;

  const Icon = icons[type] || Sun;
  const title = titles[type]?.[language] || titles[type]?.en || "";

  // Parse markdown-like content for rendering
  const renderContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} className="h-2" />;

      // Headers
      if (trimmed.startsWith("### ")) {
        return <h3 key={i} className="text-base font-serif text-gradient-gold mt-4 mb-2">{trimmed.slice(4)}</h3>;
      }
      if (trimmed.startsWith("## ")) {
        return <h2 key={i} className="text-lg font-serif text-gradient-gold mt-4 mb-2">{trimmed.slice(3)}</h2>;
      }

      // Bullet points
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const bulletText = trimmed.slice(2);
        return (
          <div key={i} className="flex gap-2 mb-2">
            <span className="text-primary mt-0.5 shrink-0">✦</span>
            <span className="text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{
              __html: bulletText.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>')
            }} />
          </div>
        );
      }

      // Regular paragraph with bold support
      return (
        <p key={i} className="text-sm text-muted-foreground leading-relaxed mb-2" dangerouslySetInnerHTML={{
          __html: trimmed.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>')
        }} />
      );
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto bg-background border-primary/20">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full gradient-gold flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6 text-primary-foreground" strokeWidth={1.5} />
            </div>
            <div>
              <SheetTitle className="font-serif text-xl text-gradient-gold text-left">
                {title}
              </SheetTitle>
              <p className="text-base mt-0.5 text-left">
                <span className="text-xl mr-1.5">{signEmoji}</span>
                <span className="font-medium text-foreground">{signName}</span>
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="pb-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">
                {language === "ka" ? "ვიკვლევ შენს ნიშანს..." : "Exploring your sign..."}
              </p>
            </div>
          ) : content ? (
            <div className="space-y-1">
              {renderContent(content)}
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Big3DetailSheet;
