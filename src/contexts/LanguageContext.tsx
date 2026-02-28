import React, { createContext, useContext, useState, useCallback } from "react";

type Language = "en" | "ka";

type Translations = {
  [key: string]: { en: string; ka: string };
};

const translations: Translations = {
  // Navigation
  "nav.home": { en: "Home", ka: "მთავარი" },
  "nav.chat": { en: "Chat", ka: "ჩატი" },
  "nav.compatibility": { en: "Compatibility", ka: "თავსებადობა" },
  "nav.profile": { en: "Profile", ka: "პროფილი" },

  // Common
  "app.tagline": { en: "Your Personal AI Astrologer", ka: "თქვენი პირადი AI ასტროლოგი" },
  "app.name": { en: "Astrochat", ka: "Astrochat" },

  // Auth
  "auth.login": { en: "Log In", ka: "შესვლა" },
  "auth.signup": { en: "Sign Up", ka: "რეგისტრაცია" },
  "auth.email": { en: "Email", ka: "ელ.ფოსტა" },
  "auth.password": { en: "Password", ka: "პაროლი" },
  "auth.terms": {
    en: "I agree to the Terms & Conditions and understand that this app is for entertainment purposes only.",
    ka: "ვეთანხმები წესებსა და პირობებს და ვაცნობიერებ, რომ ეს აპლიკაცია მხოლოდ გასართობი მიზნებისთვისაა."
  },

  // Dashboard
  "dashboard.big3": { en: "Your Big 3", ka: "თქვენი დიდი 3" },
  "dashboard.sun": { en: "Sun", ka: "მზე" },
  "dashboard.moon": { en: "Moon", ka: "მთვარე" },
  "dashboard.rising": { en: "Rising", ka: "ასცენდენტი" },
  "dashboard.daily": { en: "Daily Insight", ka: "დღის ინსაიტი" },
  "dashboard.greeting": { en: "Welcome", ka: "მოგესალმებით" },

  // Zodiac Signs
  "zodiac.Aries": { en: "Aries", ka: "ვერძი" },
  "zodiac.Taurus": { en: "Taurus", ka: "კურო" },
  "zodiac.Gemini": { en: "Gemini", ka: "ტყუპები" },
  "zodiac.Cancer": { en: "Cancer", ka: "კირჩხიბი" },
  "zodiac.Leo": { en: "Leo", ka: "ლომი" },
  "zodiac.Virgo": { en: "Virgo", ka: "ქალწული" },
  "zodiac.Libra": { en: "Libra", ka: "სასწორი" },
  "zodiac.Scorpio": { en: "Scorpio", ka: "მორიელი" },
  "zodiac.Sagittarius": { en: "Sagittarius", ka: "მშვილდოსანი" },
  "zodiac.Capricorn": { en: "Capricorn", ka: "თხის რქა" },
  "zodiac.Aquarius": { en: "Aquarius", ka: "მერწყული" },
  "zodiac.Pisces": { en: "Pisces", ka: "თევზები" },

  // Chat
  "chat.placeholder": { en: "Ask the stars...", ka: "ჰკითხე ვარსკვლავებს..." },
  "chat.disclaimer": {
    en: "AI advice is for entertainment only. Not medical/legal advice.",
    ka: "AI რჩევა მხოლოდ გასართობია. არ არის სამედიცინო/იურიდიული რჩევა."
  },

  // Premium
  // Compatibility
  "compat.title": { en: "Zodiac Compatibility", ka: "ზოდიაქოს თავსებადობა" },
  "compat.partnerDob": { en: "Partner's Date of Birth", ka: "პარტნიორის დაბადების თარიღი" },
  "compat.check": { en: "Check Compatibility", ka: "შეამოწმე თავსებადობა" },
  "compat.score": { en: "Compatibility Score", ka: "თავსებადობის ქულა" },
  "compat.strengths": { en: "Strengths", ka: "ძლიერი მხარეები" },
  "compat.challenges": { en: "Challenges", ka: "გამოწვევები" },
  "compat.soulmate": { en: "Soulmate", ka: "სულის მეგობარი" },
  "compat.great": { en: "Great Match", ka: "შესანიშნავი წყვილი" },
  "compat.good": { en: "Good Match", ka: "კარგი წყვილი" },
  "compat.challenging": { en: "Challenging", ka: "რთული" },
  "compat.pickDate": { en: "Pick a date", ka: "აირჩიეთ თარიღი" },

  // Premium
  "premium.title": { en: "Unlock Your Cosmic Destiny", ka: "გახსენი შენი კოსმიური ბედისწერა" },
  "premium.monthly": { en: "Monthly", ka: "ყოველთვიური" },
  "premium.quarterly": { en: "Quarterly", ka: "კვარტალური" },
  "premium.save": { en: "Save 33%", ka: "დაზოგე 33%" },
  "premium.upgrade": { en: "Upgrade Now", ka: "გააუმჯობესე ახლა" },
  "premium.bestValue": { en: "Best Value", ka: "საუკეთესო შეთავაზება" },

  // Onboarding
  "onboarding.name": { en: "Your Name", ka: "თქვენი სახელი" },
  "onboarding.dob": { en: "Date of Birth", ka: "დაბადების თარიღი" },
  "onboarding.time": { en: "Exact Time of Birth", ka: "ზუსტი დაბადების დრო" },
  "onboarding.place": { en: "Place of Birth", ka: "დაბადების ადგილი" },
  "onboarding.continue": { en: "Continue", ka: "გაგრძელება" },

  // Profile
  "profile.settings": { en: "Settings", ka: "პარამეტრები" },
  "profile.language": { en: "Language", ka: "ენა" },
  "profile.subscription": { en: "Subscription", ka: "გამოწერა" },
  "profile.free": { en: "Free Plan", ka: "უფასო გეგმა" },
  "profile.premium": { en: "Premium", ka: "პრემიუმ" },
  "profile.legal": {
    en: "Astrochat is for entertainment purposes only. Not a substitute for professional advice.",
    ka: "Astrochat მხოლოდ გასართობი მიზნებისთვისაა. არ ანაცვლებს პროფესიონალურ რჩევას."
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("en");

  const t = useCallback(
    (key: string): string => {
      return translations[key]?.[language] ?? key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
