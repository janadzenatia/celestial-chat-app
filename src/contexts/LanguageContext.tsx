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
  "nav.family": { en: "Family", ka: "ოჯახი" },
  "nav.profile": { en: "Profile", ka: "პროფილი" },

  // Family Planning Hub
  "family.title": { en: "Family & Cosmic Planning", ka: "ოჯახი და კოსმიური დაგეგმვა" },
  "family.subtitle": { en: "Discover the cosmic blueprint of your family", ka: "აღმოაჩინეთ თქვენი ოჯახის კოსმიური გეგმა" },
  "family.myChildren": { en: "My Children", ka: "ჩემი შვილები" },
  "family.missingPiece": { en: "Missing Piece", ka: "დაკარგული ნაწილი" },
  "family.calculator": { en: "Calculator", ka: "კალკულატორი" },
  "family.loading": { en: "Loading...", ka: "იტვირთება..." },
  "family.addChild": { en: "Add a Child", ka: "შვილის დამატება" },
  "family.childNamePlaceholder": { en: "Child's name...", ka: "შვილის სახელი..." },
  "family.save": { en: "Save", ka: "შენახვა" },
  "family.cancel": { en: "Cancel", ka: "გაუქმება" },
  "family.analyzeChild": { en: "Analyze Cosmic Connection", ka: "კოსმიური კავშირის ანალიზი" },
  "family.analyzingChild": { en: "Analyzing stars...", ka: "ვარსკვლავების ანალიზი..." },
  "family.blueprint": { en: "Cosmic Blueprint", ka: "კოსმიური გეგმა" },
  "family.emotionalBond": { en: "Emotional Bond", ka: "ემოციური კავშირი" },
  "family.parentingAdvice": { en: "Parenting Advice", ka: "აღზრდის რჩევები" },
  "family.missingPieceTitle": { en: "The Missing Cosmic Piece", ka: "დაკარგული კოსმიური ნაწილი" },
  "family.missingPieceDesc": { en: "Discover which Zodiac sign would bring ultimate balance to your family", ka: "აღმოაჩინეთ რომელი ზოდიაქოს ნიშანი მოიტანს სრულ ბალანსს თქვენს ოჯახში" },
  "family.needPartnerData": { en: "Please add your partner's data on the Compatibility page first", ka: "გთხოვთ ჯერ დაამატოთ პარტნიორის მონაცემები თავსებადობის გვერდზე" },
  "family.findMissingPiece": { en: "Find the Missing Piece", ka: "იპოვე დაკარგული ნაწილი" },
  "family.analyzing": { en: "Consulting the cosmos...", ka: "კოსმოსთან კონსულტაცია..." },
  "family.regenerate": { en: "Regenerate", ka: "ხელახლა გენერაცია" },
  "family.planSign": { en: "Plan a Sign", ka: "დაგეგმე ნიშანი" },
  "family.expecting": { en: "I'm Expecting", ka: "ველოდები ბავშვს" },
  "family.planSignTitle": { en: "Plan Your Baby's Sign", ka: "დაგეგმეთ ბავშვის ნიშანი" },
  "family.planSignDesc": { en: "Select a Zodiac sign to see the ideal conception window", ka: "აირჩიეთ ზოდიაქოს ნიშანი იდეალური ჩასახვის ფანჯრის სანახავად" },
  "family.conceptionWindow": { en: "Ideal Conception Window", ka: "იდეალური ჩასახვის პერიოდი" },
  "family.conceptionNote": { en: "Based on approximately 40 weeks (280 days) of pregnancy", ka: "დაფუძნებულია ორსულობის დაახლოებით 40 კვირაზე (280 დღე)" },
  "family.expectingTitle": { en: "I'm Expecting!", ka: "ველოდები ბავშვს!" },
  "family.expectingDesc": { en: "Enter your estimated due date to discover your baby's sign", ka: "შეიყვანეთ სავარაუდო ვადა ბავშვის ნიშნის აღმოსაჩენად" },
  "family.dueDate": { en: "Estimated Due Date", ka: "სავარაუდო ვადა" },
  "family.revealPersonality": { en: "Reveal Baby's Personality", ka: "ბავშვის პიროვნების გამოვლენა" },

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
  "auth.acceptTerms": { en: "Please accept the Terms & Conditions", ka: "გთხოვთ დაეთანხმოთ წესებსა და პირობებს" },
  "auth.checkEmail": { en: "Check your email to verify your account! ✨", ka: "შეამოწმეთ ელ.ფოსტა ანგარიშის დასადასტურებლად! ✨" },
  "auth.invalidCredentials": { en: "Invalid login credentials", ka: "არასწორი ელ.ფოსტა ან პაროლი" },
  "auth.userNotFound": { en: "User not found", ka: "მომხმარებელი ვერ მოიძებნა" },
  "auth.genericError": { en: "Something went wrong. Please try again.", ka: "რაღაც შეცდომა მოხდა. სცადეთ თავიდან." },
  "auth.loading": { en: "Please wait...", ka: "გთხოვთ მოიცადოთ..." },
  "auth.alreadyHaveAccount": { en: "Already have an account?", ka: "უკვე გაქვთ ანგარიში?" },
  "auth.noAccount": { en: "Don't have an account?", ka: "არ გაქვთ ანგარიში?" },

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
  "compat.partnerName": { en: "Partner's Name", ka: "პარტნიორის სახელი" },
  "compat.partnerNamePlaceholder": { en: "Enter name...", ka: "შეიყვანეთ სახელი..." },
  "compat.partnerTime": { en: "Partner's Birth Time (optional)", ka: "პარტნიორის დაბადების დრო (არასავალდებულო)" },
  "compat.partnerTimePlaceholder": { en: "HH:MM (e.g. 14:30)", ka: "სთ:წთ (მაგ. 14:30)" },
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
  "compat.relationshipDate": { en: "Marriage / Relationship Start Date", ka: "ქორწინების / ურთიერთობის დაწყების თარიღი" },

  // Compatibility summaries
  "compat.summary.soulmate": { en: "A cosmic soulmate connection. The stars align beautifully for this pairing.", ka: "კოსმიური სულის მეგობრის კავშირი. ვარსკვლავები ლამაზად ერწყმის ამ წყვილს." },
  "compat.summary.great": { en: "A naturally strong bond. This is a dynamic and rewarding connection.", ka: "ბუნებრივად ძლიერი კავშირი. დინამიური და ნაყოფიერი ურთიერთობა." },
  "compat.summary.good": { en: "A solid relationship built with mutual effort and understanding.", ka: "მყარი ურთიერთობა, აგებული ორმხრივი ძალისხმევით და გაგებით." },
  "compat.summary.challenging": { en: "Cosmic tension exists, but great growth awaits those who persevere.", ka: "კოსმიური დაძაბულობა არსებობს, მაგრამ დიდი ზრდა ელით მათ, ვინც გამძლეობას გამოიჩენს." },

  // Compatibility strengths
  "compat.str.deepEmotional": { en: "Deep emotional understanding", ka: "ღრმა ემოციური გაგება" },
  "compat.str.naturalChemistry": { en: "Natural chemistry and attraction", ka: "ბუნებრივი ქიმია და მიზიდულობა" },
  "compat.str.sharedValues": { en: "Shared values and life goals", ka: "საერთო ღირებულებები და ცხოვრებისეული მიზნები" },
  "compat.str.strongComm": { en: "Strong communication flow", ka: "ძლიერი კომუნიკაციის ნაკადი" },
  "compat.str.complementary": { en: "Complementary strengths", ka: "ერთმანეთის შემავსებელი ძლიერი მხარეები" },
  "compat.str.excitingDynamic": { en: "Exciting dynamic energy", ka: "ამაღელვებელი დინამიური ენერგია" },
  "compat.str.mutualRespect": { en: "Mutual respect and admiration", ka: "ორმხრივი პატივისცემა და აღტაცება" },
  "compat.str.growthDifferences": { en: "Growth through differences", ka: "განვითარება განსხვავებების მეშვეობით" },
  "compat.str.balancedPerspectives": { en: "Balanced perspectives", ka: "დაბალანსებული პერსპექტივები" },
  "compat.str.profoundGrowth": { en: "Opportunity for profound growth", ka: "ღრმა ზრდის შესაძლებლობა" },
  "compat.str.patience": { en: "Learning patience and compromise", ka: "მოთმინებისა და კომპრომისის სწავლა" },
  "compat.str.resilience": { en: "Building resilience together", ka: "გამძლეობის ერთად აშენება" },

  // Compatibility challenges
  "compat.ch.tooComfortable": { en: "May become too comfortable", ka: "შეიძლება ზედმეტად კომფორტული გახდეს" },
  "compat.ch.individuality": { en: "Need to maintain individuality", ka: "საჭიროა ინდივიდუალობის შენარჩუნება" },
  "compat.ch.miscommunication": { en: "Occasional miscommunication", ka: "ხანდახან გაუგებრობა კომუნიკაციაში" },
  "compat.ch.differentPacing": { en: "Different pacing in decisions", ka: "განსხვავებული ტემპი გადაწყვეტილებებში" },
  "compat.ch.emotionalStyles": { en: "Differing emotional styles", ka: "განსხვავებული ემოციური სტილები" },
  "compat.ch.extraEffort": { en: "Need extra effort to connect deeply", ka: "საჭიროა დამატებითი ძალისხმევა ღრმა კავშირისთვის" },
  "compat.ch.differentApproaches": { en: "Fundamentally different approaches", ka: "ფუნდამენტურად განსხვავებული მიდგომები" },
  "compat.ch.clashingTemperaments": { en: "Clashing temperaments", ka: "ტემპერამენტების შეუთავსებლობა" },
  "compat.ch.consciousCompromise": { en: "Requires conscious compromise", ka: "მოითხოვს შეგნებულ კომპრომისს" },

  // Elements
  "element.Fire": { en: "Fire", ka: "ცეცხლი" },
  "element.Earth": { en: "Earth", ka: "მიწა" },
  "element.Air": { en: "Air", ka: "ჰაერი" },
  "element.Water": { en: "Water", ka: "წყალი" },

  // Relationship Forecast
  "forecast.title": { en: "Relationship Forecast", ka: "ურთიერთობის პროგნოზი" },
  "forecast.description": { en: "Get a 12-month transit forecast for your relationship", ka: "მიიღეთ 12-თვიანი ტრანზიტული პროგნოზი თქვენი ურთიერთობისთვის" },
  "forecast.generate": { en: "Reveal Forecast", ka: "პროგნოზის ნახვა" },
  "forecast.generating": { en: "Reading the transits...", ka: "ტრანზიტების წაკითხვა..." },
  "forecast.loading": { en: "Loading forecast...", ka: "პროგნოზის ჩატვირთვა..." },

  // Synastry Report
  "synastry.title": { en: "Deep Synastry Report", ka: "ღრმა სინასტრიის ანალიზი" },
  "synastry.description": { en: "Get a detailed 4-category compatibility analysis powered by AI", ka: "მიიღეთ დეტალური 4-კატეგორიანი თავსებადობის ანალიზი AI-ის მეშვეობით" },
  "synastry.generate": { en: "Generate Deep Report", ka: "ღრმა ანალიზის გენერაცია" },
  "synastry.generating": { en: "Analyzing charts...", ka: "რუქების ანალიზი..." },
  "synastry.loading": { en: "Loading report...", ka: "ანალიზის ჩატვირთვა..." },
  "synastry.overallScore": { en: "Overall Compatibility Score", ka: "საერთო თავსებადობის ქულა" },
  "synastry.emotional": { en: "Emotional Connection", ka: "ემოციური კავშირი" },
  "synastry.romantic": { en: "Physical & Romantic Chemistry", ka: "ფიზიკური და რომანტიკული ქიმია" },
  "synastry.communication": { en: "Communication", ka: "კომუნიკაცია" },
  "synastry.goals": { en: "Shared Goals & Finances", ka: "საერთო მიზნები და ფინანსები" },
  "synastry.timeBanner": {
    en: "Because you provided the exact birth time, we analyzed {name}'s Moon and Rising signs for maximum precision.",
    ka: "რადგან თქვენ მიუთითეთ ზუსტი დაბადების დრო, ჩვენ გავაანალიზეთ {name}-ის მთვარისა და ასცენდენტის ნიშნები მაქსიმალური სიზუსტისთვის."
  },
  "synastry.partner": { en: "the partner", ka: "პარტნიორის" },

  // Birth Time Modal
  "timeModal.title": { en: "Unlock Deeper Analysis", ka: "ღრმა ანალიზის გახსნა" },
  "timeModal.description": {
    en: "Do you know {name}'s exact birth time? It unlocks deeper Moon & Rising sign analysis for maximum precision.",
    ka: "იცით {name}-ის ზუსტი დაბადების დრო? ეს ხსნის მთვარისა და ასცენდენტის ღრმა ანალიზს მაქსიმალური სიზუსტისთვის."
  },
  "timeModal.inputLabel": { en: "Birth Time", ka: "დაბადების დრო" },
  "timeModal.withTime": { en: "Analyze with Time", ka: "ანალიზი დროით" },
  "timeModal.skip": { en: "Skip — I don't know", ka: "გამოტოვება — არ ვიცი" },

  // Forecast teaser
  "forecast.unlock": { en: "Unlock Forecast", ka: "პროგნოზის გახსნა" },

  // Validation
  "validation.invalidDate": { en: "Please enter a valid date (year 1920–present)", ka: "გთხოვთ შეიყვანოთ ვალიდური თარიღი (წელი 1920–დღემდე)" },
  "validation.futureDate": { en: "Date cannot be in the future", ka: "თარიღი არ შეიძლება იყოს მომავალში" },

  // Wealth & Career
  "wealth.title": { en: "Wealth & Career Destiny", ka: "სიმდიდრე და კარიერის ბედისწერა" },
  "wealth.description": { en: "Discover your cosmic career path, financial potential, and lifelong professional timeline based on your birth chart.", ka: "აღმოაჩინეთ თქვენი კოსმიური კარიერის გზა, ფინანსური პოტენციალი და მთელი ცხოვრების პროფესიული ქრონოლოგია თქვენი დაბადების რუქის საფუძველზე." },
  "wealth.unlock": { en: "Unlock Financial Destiny", ka: "ფინანსური ბედისწერის გახსნა" },
  "wealth.generating": { en: "Mapping your destiny...", ka: "ბედისწერის რუქის შედგენა..." },
  "wealth.calling": { en: "Cosmic Calling — Ideal Professions", ka: "კოსმიური მოწოდება — იდეალური პროფესიები" },
  "wealth.dna": { en: "Wealth DNA — Financial Potential", ka: "სიმდიდრის DNA — ფინანსური პოტენციალი" },
  "wealth.timeline": { en: "Lifelong Career Timeline", ka: "კარიერის სრული ქრონოლოგია" },

  // Premium
  "premium.title": { en: "Unlock Your Cosmic Destiny", ka: "გახსენი შენი კოსმიური ბედისწერა" },
  "premium.monthly": { en: "Monthly", ka: "ყოველთვიური" },
  "premium.quarterly": { en: "Quarterly", ka: "კვარტალური" },
  "premium.save": { en: "Save 33%", ka: "დაზოგე 33%" },
  "premium.upgrade": { en: "Upgrade Now", ka: "გააუმჯობესე ახლა" },
  "premium.bestValue": { en: "Best Value", ka: "საუკეთესო შეთავაზება" },

  // Cosmic Match
  "cosmic.title": { en: "Your Ideal Cosmic Match", ka: "თქვენი იდეალური კოსმიური წყვილი" },
  "cosmic.badge": { en: "Premium", ka: "პრემიუმ" },
  "cosmic.generate": { en: "Reveal My Match", ka: "გამოავლინე ჩემი წყვილი" },
  "cosmic.regenerate": { en: "Regenerate", ka: "ხელახლა გენერაცია" },
  "cosmic.signs": { en: "Compatible Signs", ka: "თავსებადი ნიშნები" },
  "cosmic.years": { en: "Ideal Birth Years", ka: "იდეალური დაბადების წლები" },
  "cosmic.profile": { en: "Partner Profile", ka: "პარტნიორის პროფილი" },
  "cosmic.generating": { en: "Consulting the cosmos...", ka: "კოსმოსთან კონსულტაცია..." },

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

  // Cosmic Hook
  "hook.label": { en: "Cosmic Alert", ka: "კოსმიური შეტყობინება" },
  "hook.generating": { en: "Scanning the stars for you...", ka: "ვარსკვლავების სკანირება..." },
  "hook.dismiss": { en: "Dismiss", ka: "დახურვა" },
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
