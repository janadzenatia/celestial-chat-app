import { Sparkles } from "lucide-react";
import LanguageToggle from "./LanguageToggle";

const AppHeader = () => {
  return (
    <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-40 glass-strong">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-serif text-lg font-semibold text-gradient-gold">Astrochat</span>
      </div>
      <LanguageToggle />
    </header>
  );
};

export default AppHeader;
