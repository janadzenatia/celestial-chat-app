import AppHeader from "@/components/AppHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { Send } from "lucide-react";

const ChatPage = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      <AppHeader />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <div className="text-5xl animate-float">✨</div>
          <h2 className="font-serif text-xl text-gradient-gold">Ask the Stars</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            Your mystical AI astrologer awaits. Coming soon with Lovable Cloud.
          </p>
        </div>
      </div>
      <div className="px-4 pb-4 space-y-2">
        <div className="flex gap-2">
          <input
            className="flex-1 glass rounded-full px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder={t("chat.placeholder")}
            disabled
          />
          <button className="w-11 h-11 rounded-full gradient-gold flex items-center justify-center shrink-0 opacity-50">
            <Send className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center">{t("chat.disclaimer")}</p>
      </div>
    </div>
  );
};

export default ChatPage;
