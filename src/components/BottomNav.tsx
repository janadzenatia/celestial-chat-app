import { Home, MessageCircle, Heart, User, Baby } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const tabs = [
  { key: "nav.home", icon: Home, path: "/home" },
  { key: "nav.chat", icon: MessageCircle, path: "/chat" },
  { key: "nav.compatibility", icon: Heart, path: "/compatibility" },
  { key: "nav.family", icon: Baby, path: "/family" },
  { key: "nav.profile", icon: User, path: "/profile" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-white/10 safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto px-2 py-2">
        {tabs.map(({ key, icon: Icon, path }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-200 ${
                active
                  ? "text-primary scale-105"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{t(key)}</span>
              {active && (
                <div className="w-1 h-1 rounded-full gradient-gold mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
