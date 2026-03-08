import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();
  const { user } = useAuth();

  const handleChange = (lang: "en" | "ka") => {
    setLanguage(lang);
    // Also persist to profile in background
    if (user) {
      supabase.from("profiles").update({ language_preference: lang }).eq("user_id", user.id);
    }
  };

  return (
    <div className="flex items-center glass rounded-full p-0.5 text-xs font-medium">
      <button
        onClick={() => handleChange("en")}
        className={`px-3 py-1.5 rounded-full transition-all duration-200 ${
          language === "en"
            ? "gradient-gold text-primary-foreground font-semibold"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        ENG
      </button>
      <button
        onClick={() => handleChange("ka")}
        className={`px-3 py-1.5 rounded-full transition-all duration-200 ${
          language === "ka"
            ? "gradient-gold text-primary-foreground font-semibold"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        GEO
      </button>
    </div>
  );
};

export default LanguageToggle;
