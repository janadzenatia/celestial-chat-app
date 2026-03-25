import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";

const LandingPage = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full bg-secondary/5 blur-[100px]" />
      </div>

      {/* Language toggle */}
      <div className="absolute top-4 right-4 z-10" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <LanguageToggle />
      </div>

      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center gap-8 px-6 text-center max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-2xl gradient-gold flex items-center justify-center shadow-gold">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="font-serif text-4xl font-bold text-gradient-gold">Astrochat</h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            {language === "ka"
              ? "შენი პირადი ასტროლოგიური ასისტენტი — ყოველდღიური ინსაითები, თავსებადობა და კოსმიური გეგმა."
              : "Your personal astrology assistant — daily insights, compatibility, and cosmic blueprint."}
          </p>
        </div>

        {/* App Store buttons */}
        <div className="flex flex-col gap-3 w-full">
          <a
            href="#"
            className="flex items-center justify-center gap-3 w-full py-3.5 px-6 rounded-xl bg-foreground text-background font-medium text-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[10px] opacity-80">
                {language === "ka" ? "ჩამოტვირთე" : "Download on the"}
              </span>
              <span className="text-base font-semibold">App Store</span>
            </div>
          </a>

          <a
            href="#"
            className="flex items-center justify-center gap-3 w-full py-3.5 px-6 rounded-xl bg-foreground text-background font-medium text-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.18 23.49c.35.17.75.22 1.13.13l11.43-6.58-3.18-3.18L3.18 23.49zM.53 1.27C.2 1.59 0 2.07 0 2.68v18.64c0 .61.2 1.09.53 1.41l.08.07 10.45-10.45v-.24L.61 1.2.53 1.27zM20.16 10.33l-3.25-1.87-3.5 3.5 3.5 3.5 3.26-1.88c.93-.52.93-1.38 0-1.9v-.02l-.01.01v-.01l.01-.01-.01.01v-.33zM4.31.5L15.74 7.09l-2.93 2.93L4.31.5z"/>
            </svg>
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[10px] opacity-80">
                {language === "ka" ? "ჩამოტვირთე" : "GET IT ON"}
              </span>
              <span className="text-base font-semibold">Google Play</span>
            </div>
          </a>
        </div>

        {/* Footer links */}
        <div className="flex gap-4 text-xs text-muted-foreground">
          <Link to="/privacy" className="hover:text-foreground transition-colors">
            {language === "ka" ? "კონფიდენციალურობა" : "Privacy Policy"}
          </Link>
          <span>·</span>
          <Link to="/terms" className="hover:text-foreground transition-colors">
            {language === "ka" ? "პირობები" : "Terms"}
          </Link>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
