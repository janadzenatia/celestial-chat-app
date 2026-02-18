import { useLanguage } from "@/contexts/LanguageContext";

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center glass rounded-full p-0.5 text-xs font-medium">
      <button
        onClick={() => setLanguage("en")}
        className={`px-3 py-1.5 rounded-full transition-all duration-200 ${
          language === "en"
            ? "gradient-gold text-primary-foreground font-semibold"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        ENG
      </button>
      <button
        onClick={() => setLanguage("ka")}
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
