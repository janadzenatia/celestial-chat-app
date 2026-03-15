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
  "family.missingPiece": { en: "Missing Piece", ka: "კოსმიური ბალანსი" },
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
  "family.missingPieceTitle": { en: "The Missing Cosmic Piece", ka: "კოსმიური ბალანსი" },
  "family.missingPieceDesc": { en: "Discover which Zodiac sign would bring ultimate balance to your family", ka: "აღმოაჩინეთ რომელი ზოდიაქოს ნიშანი მოიტანს სრულ ბალანსს თქვენს ოჯახში" },
  "family.needPartnerData": { en: "Please add your partner's data on the Compatibility page first", ka: "გთხოვთ ჯერ დაამატოთ პარტნიორის მონაცემები თავსებადობის გვერდზე" },
  "family.findMissingPiece": { en: "Find the Missing Piece", ka: "კოსმიური ბალანსის პოვნა" },
  "family.analyzing": { en: "Consulting the cosmos...", ka: "კოსმოსთან კონსულტაცია..." },
  "family.regenerate": { en: "Regenerate", ka: "ხელახლა გენერაცია" },
  "family.analyzedMembers": { en: "Family analyzed", ka: "გაანალიზებული ოჯახი" },

  // Trial
  "trial.days": { en: "d", ka: "დ" },
  "trial.hours": { en: "h", ka: "სთ" },
  "trial.notice": { en: "Your free trial ends in {time}. You will be charged on day 4. Cancel anytime in App Store / Play Store settings.", ka: "თქვენი უფასო საცდელი პერიოდი მთავრდება {time}-ში. გადახდა მოხდება მე-4 დღეს. გაუქმება ნებისმიერ დროს შეგიძლიათ App Store / Play Store-ის პარამეტრებში." },

  "family.planSign": { en: "Plan a Sign", ka: "დაგეგმე ნიშანი" },
  "family.expecting": { en: "I'm Expecting", ka: "ველოდები ბავშვს" },
  "family.planSignTitle": { en: "Plan Your Baby's Sign", ka: "დაგეგმეთ ბავშვის ნიშანი" },
  "family.planSignDesc": { en: "Select a Zodiac sign to see the ideal conception window", ka: "აირჩიეთ ზოდიაქოს ნიშანი იდეალური ჩასახვის ფანჯრის სანახავად" },
  "family.conceptionWindow": { en: "Ideal Conception Window", ka: "იდეალური ჩასახვის პერიოდი" },
  "family.conceptionNote": { en: "Based on approximately 40 weeks (280 days) of pregnancy", ka: "დაფუძნებულია ორსულობის დაახლოებით 40 კვირაზე (280 დღე)" },
  "family.expectingTitle": { en: "I'm Expecting!", ka: "ველოდები ბავშვს!" },
  "family.expectingDesc": { en: "Enter your estimated due date to discover your baby's sign", ka: "შეიყვანეთ მშობიარობის სავარაუდო თარიღი ბავშვის ნიშნის გასაგებად" },
  "family.dueDate": { en: "Estimated Due Date", ka: "დაბადების თარიღი" },
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
  "auth.orContinueWith": { en: "or continue with", ka: "ან გააგრძელეთ" },

  // Dashboard
  "dashboard.big3": { en: "Your Big 3", ka: "თქვენი დიდი 3" },
  "dashboard.sun": { en: "Sun", ka: "მზე" },
  "dashboard.moon": { en: "Moon", ka: "მთვარე" },
  "dashboard.rising": { en: "Rising", ka: "ასცენდენტი" },
  "dashboard.daily": { en: "Daily Insight", ka: "დღის ინსაიტი" },
  "dashboard.phrase": { en: "Phrase of the Day", ka: "დღის ფრაზა" },
  "dashboard.greeting": { en: "Welcome", ka: "მოგესალმებით" },

  // Synastry CTA
  "synastry.cta.message": {
    en: "Basic Zodiac signs only reveal 20% of your relationship story. For a truly accurate reading, exact birth times change everything.",
    ka: "მხოლოდ ზოდიაქოს ნიშანი ურთიერთობის სურათის 20%-ს აჩვენებს. ზუსტი ანალიზისთვის აუცილებელია დაბადების საათის ცოდნა."
  },
  "synastry.cta.button": { en: "Calculate Deep Synastry", ka: "ღრმა თავსებადობის ანალიზი" },

  // Cosmic Calendar
  "calendar.title": { en: "Cosmic Traffic Light", ka: "კოსმიური შუქნიშანი" },
  "calendar.description": { en: "Reveal your green and red days this month — know when to act and when to pause.", ka: "აღმოაჩინეთ თქვენი მწვანე და წითელი დღეები ამ თვეში — იცოდეთ როდის იმოქმედოთ და როდის შეჩერდეთ." },
  "calendar.generate": { en: "Reveal My Calendar", ka: "ჩემი კალენდრის ნახვა" },
  "calendar.generating": { en: "Mapping the stars...", ka: "ვარსკვლავების რუქის შედგენა..." },
  "calendar.favorable": { en: "Favorable", ka: "ხელსაყრელი" },
  "calendar.challenging": { en: "Challenging", ka: "რთული" },
  "calendar.neutral": { en: "Neutral", ka: "ნეიტრალური" },

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

  // Chinese Zodiac
  "czodiac.Rat": { en: "Rat", ka: "ვირთხა" },
  "czodiac.Ox": { en: "Ox", ka: "ხარი" },
  "czodiac.Tiger": { en: "Tiger", ka: "ვეფხვი" },
  "czodiac.Rabbit": { en: "Rabbit", ka: "კურდღელი" },
  "czodiac.Dragon": { en: "Dragon", ka: "დრაკონი" },
  "czodiac.Snake": { en: "Snake", ka: "გველი" },
  "czodiac.Horse": { en: "Horse", ka: "ცხენი" },
  "czodiac.Goat": { en: "Goat", ka: "თხა" },
  "czodiac.Monkey": { en: "Monkey", ka: "მაიმუნი" },
  "czodiac.Rooster": { en: "Rooster", ka: "მამალი" },
  "czodiac.Dog": { en: "Dog", ka: "ძაღლი" },
  "czodiac.Pig": { en: "Pig", ka: "ღორი" },

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
  "timeModal.unknownTime": { en: "I don't know the exact time", ka: "ზუსტი დრო არ ვიცი" },
  "timeModal.relationshipDateHint": { en: "Optional — improves timeline accuracy", ka: "არასავალდებულო — აუმჯობესებს პროგნოზის სიზუსტეს" },

  // Forecast teaser
  "forecast.unlock": { en: "Unlock Forecast", ka: "პროგნოზის გახსნა" },

  // Validation
  "validation.invalidDate": { en: "Please enter a valid date (year 1920–present)", ka: "გთხოვთ შეიყვანოთ ვალიდური თარიღი (წელი 1920–დღემდე)" },
  "validation.futureDate": { en: "Date cannot be in the future", ka: "თარიღი არ შეიძლება იყოს მომავალში" },
  "validation.invalidDueDate": { en: "Please enter a valid pregnancy due date.", ka: "გთხოვთ, შეიყვანოთ მშობიარობის რეალური თარიღი." },

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
  "profile.logout": { en: "Log Out", ka: "ანგარიშიდან გასვლა" },
  "profile.loggedOut": { en: "Logged out successfully", ka: "წარმატებით გამოხვედით" },
  "profile.cancelSubscription": { en: "Cancel Subscription", ka: "გამოწერის გაუქმება" },
  "profile.cancelTitle": { en: "Cancel Premium?", ka: "გაუქმდეს პრემიუმი?" },
  "profile.cancelDescription": {
    en: "Are you sure you want to cancel? You will lose access to the Cosmic Calendar, Deep Synastry, and other advanced features.",
    ka: "ნამდვილად გსურთ გაუქმება? თქვენ დაკარგავთ წვდომას კოსმიურ კალენდარზე და სხვა პრემიუმ ფუნქციებზე."
  },
  "profile.keepPremium": { en: "Keep Premium", ka: "პრემიუმის დატოვება" },
  "profile.yesCancel": { en: "Yes, Cancel", ka: "დიახ, გაუქმება" },
  "profile.canceling": { en: "Canceling...", ka: "უქმდება..." },
  "profile.cancelSuccess": { en: "Subscription canceled successfully.", ka: "გამოწერა წარმატებით გაუქმდა." },
  "profile.changePassword": { en: "Change Password", ka: "პაროლის შეცვლა" },
  "profile.newPassword": { en: "New Password", ka: "ახალი პაროლი" },
  "profile.confirmNewPassword": { en: "Confirm New Password", ka: "დაადასტურეთ ახალი პაროლი" },
  "profile.updatePassword": { en: "Update Password", ka: "პაროლის განახლება" },
  "profile.updatingPassword": { en: "Updating...", ka: "მიმდინარეობს..." },
  "profile.passwordSuccess": { en: "Password updated successfully!", ka: "პაროლი წარმატებით განახლდა!" },
  "profile.passwordMismatch": { en: "Passwords do not match.", ka: "პაროლები არ ემთხვევა." },
  "profile.passwordTooShort": { en: "Password must be at least 6 characters.", ka: "პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს." },
  "profile.deleteAccount": { en: "🗑️ Delete Account", ka: "🗑️ ანგარიშის წაშლა" },
  "profile.deleteTitle": { en: "Delete Account?", ka: "ანგარიშის წაშლა გსურს?" },
  "profile.deleteDescription": { en: "This action is irreversible. All your data will be permanently deleted.", ka: "ეს მოქმედება შეუქცევადია. შენი ყველა მონაცემი სამუდამოდ წაიშლება." },
  "profile.deleteConfirm": { en: "Yes, Delete", ka: "დიახ, წავშალო" },
  "profile.deleteCancel": { en: "Cancel", ka: "გაუქმება" },
  "profile.deleting": { en: "Deleting...", ka: "იშლება..." },
  "profile.deleteSuccess": { en: "Your account has been deleted.", ka: "შენი ანგარიში წაიშალა." },
  "profile.deleteError": { en: "Failed to delete account. Please try again.", ka: "ანგარიშის წაშლა ვერ მოხერხდა. სცადეთ თავიდან." },

  // Paywall
  "paywall.title": { en: "Unlock Your Cosmic Destiny", ka: "გახსენი შენი კოსმიური ბედისწერა" },
  "paywall.subtitle": { en: "Access all premium astrology features", ka: "მიიღე წვდომა ყველა პრემიუმ ასტროლოგიურ ფუნქციაზე" },
  "paywall.unlock": { en: "Unlock Premium", ka: "პრემიუმის გააქტიურება" },
  "paywall.processing": { en: "Processing...", ka: "მიმდინარეობს..." },
  "paywall.success": { en: "Premium Activated! ✨", ka: "პრემიუმი გააქტიურებულია! ✨" },
  "paywall.error": { en: "Something went wrong. Please try again.", ka: "რაღაც შეცდომა მოხდა. სცადეთ თავიდან." },
  "paywall.bestValue": { en: "Best Value", ka: "საუკეთესო არჩევანი" },
  "paywall.disclaimer": { en: "Cancel anytime. Entertainment purposes only.", ka: "გაუქმება ნებისმიერ დროს. მხოლოდ გასართობი მიზნით." },
  "paywall.premiumContent": { en: "Premium Content", ka: "პრემიუმ კონტენტი" },

  "hook.label": { en: "Cosmic Alert", ka: "კოსმიური შეტყობინება" },
  "hook.generating": { en: "Scanning the stars for you...", ka: "ვარსკვლავების სკანირება..." },
  "hook.dismiss": { en: "Dismiss", ka: "დახურვა" },

  // Legal Pages
  "legal.termsTitle": { en: "Terms & Conditions", ka: "წესები და პირობები" },
  "legal.privacyTitle": { en: "Privacy Policy", ka: "კონფიდენციალურობის პოლიტიკა" },
  "legal.disclaimerTitle": { en: "Disclaimer", ka: "პასუხისმგებლობის შეზღუდვა" },
  "legal.disclaimerText": {
    en: "Astrochat is provided for entertainment purposes only and does not replace professional medical, psychological, or financial advice.",
    ka: "Astrochat შექმნილია მხოლოდ გასართობი მიზნებისთვის და არ ანაცვლებს პროფესიონალურ სამედიცინო, ფსიქოლოგიურ ან ფინანსურ კონსულტაციას."
  },
  "legal.refundTitle": { en: "Refund Policy", ka: "თანხის დაბრუნების პოლიტიკა" },
  "legal.refundText": {
    en: "All purchases and subscriptions are final and non-refundable. Astrochat does not process or issue refunds. Since transactions are managed by the Apple App Store or Google Play, their respective refund policies apply.",
    ka: "ყველა ტრანზაქცია საბოლოოა და თანხა უკან არ ბრუნდება. Astrochat არ ამუშავებს და არ გასცემს რეფანდს. ვინაიდან გადახდები ხორციელდება Apple App Store-ის ან Google Play-ს მეშვეობით, თანხის დაბრუნების საკითხებზე ვრცელდება მათი შიდა წესები."
  },
  "legal.useTitle": { en: "Use of Service", ka: "სერვისის გამოყენება" },
  "legal.ipTitle": { en: "Intellectual Property", ka: "ინტელექტუალური საკუთრება" },
  "legal.liabilityTitle": { en: "Limitation of Liability", ka: "პასუხისმგებლობის შეზღუდვა" },
  "legal.changesTitle": { en: "Changes to Terms", ka: "წესების ცვლილებები" },
  "legal.dataCollectionTitle": { en: "Data Collection", ka: "მონაცემების შეგროვება" },
  "legal.dataUseTitle": { en: "How We Use Your Data", ka: "როგორ ვიყენებთ თქვენს მონაცემებს" },
  "legal.thirdPartyTitle": { en: "Third-Party Services", ka: "მესამე მხარის სერვისები" },
  "legal.securityTitle": { en: "Data Security", ka: "მონაცემთა უსაფრთხოება" },
  "legal.contactTitle": { en: "Contact Us", ka: "დაგვიკავშირდით" },
  "legal.termsLink": { en: "Terms & Conditions", ka: "წესები და პირობები" },
  "legal.privacyLink": { en: "Privacy Policy", ka: "კონფიდენციალურობა" },
  "auth.legalFooter": {
    en: "By signing up, you agree to our",
    ka: "რეგისტრაციით თქვენ ეთანხმებით ჩვენს"
  },
  "auth.and": { en: "and", ka: "და" },
  "auth.forgotPassword": { en: "Forgot password?", ka: "დაგავიწყდათ პაროლი?" },
  "auth.forgotTitle": { en: "Reset Password", ka: "პაროლის აღდგენა" },
  "auth.forgotDesc": { en: "Enter your email and we'll send you a reset link.", ka: "შეიყვანეთ ელ.ფოსტა და გამოგიგზავნით აღდგენის ლინკს." },
  "auth.sendResetLink": { en: "Send Reset Link", ka: "აღდგენის ლინკის გაგზავნა" },
  "auth.resetSent": { en: "Password reset link sent! Check your email. ✨", ka: "პაროლის აღდგენის ლინკი გაიგზავნა! შეამოწმეთ ელ.ფოსტა. ✨" },
  "auth.backToLogin": { en: "Back to login", ka: "შესვლაზე დაბრუნება" },
  "reset.title": { en: "Set New Password", ka: "ახალი პაროლის დაყენება" },
  "reset.newPassword": { en: "New Password", ka: "ახალი პაროლი" },
  "reset.confirmPassword": { en: "Confirm Password", ka: "გაიმეორეთ პაროლი" },
  "reset.submit": { en: "Update Password", ka: "პაროლის განახლება" },
  "reset.mismatch": { en: "Passwords do not match", ka: "პაროლები არ ემთხვევა" },
  "reset.tooShort": { en: "Password must be at least 6 characters", ka: "პაროლი მინიმუმ 6 სიმბოლო უნდა იყოს" },
  "reset.success": { en: "Password updated successfully! ✨", ka: "პაროლი წარმატებით განახლდა! ✨" },
  "reset.invalidLink": { en: "Invalid Reset Link", ka: "არასწორი ლინკი" },
  "reset.invalidLinkDesc": { en: "This link is invalid or has expired. Please request a new one.", ka: "ეს ლინკი არასწორია ან ვადაგასულია. გთხოვთ მოითხოვოთ ახალი." },

  // Cosmic Blueprint
  "blueprint.title": { en: "My Cosmic Blueprint", ka: "ჩემი კოსმიური გეგმა" },
  "blueprint.description": { en: "Discover your core personality, karmic path, and hidden strengths", ka: "აღმოაჩინეთ თქვენი ბირთვული პიროვნება, კარმული გზა და ფარული ძლიერი მხარეები" },
  "blueprint.generate": { en: "Reveal My Blueprint", ka: "ჩემი გეგმის გამოვლენა" },
  "blueprint.generating": { en: "Mapping your cosmic DNA...", ka: "კოსმიური DNA-ის რუქის შედგენა..." },

  // Partner Card
  "partner.add": { en: "Add Partner", ka: "პარტნიორის დამატება" },
  "partner.addDesc": { en: "Save your partner's profile for compatibility insights", ka: "შეინახეთ პარტნიორის პროფილი თავსებადობის ანალიზისთვის" },
  "partner.edit": { en: "Edit Partner", ka: "პარტნიორის რედაქტირება" },
  "partner.deleteTitle": { en: "Remove Partner?", ka: "პარტნიორის წაშლა?" },
  "partner.deleteDesc": { en: "This will remove the saved partner profile and all related data.", ka: "ეს წაშლის შენახულ პარტნიორის პროფილს და ყველა დაკავშირებულ მონაცემს." },
  "partner.deleteConfirm": { en: "Remove", ka: "წაშლა" },
  "partner.loveLanguage": { en: "Love Language & Relationship Style", ka: "სიყვარულის ენა და ურთიერთობის სტილი" },
  "partner.generatingLove": { en: "Discovering love language...", ka: "სიყვარულის ენის აღმოჩენა..." },
  "partner.noLoveLanguage": { en: "Love language summary will appear here", ka: "სიყვარულის ენის აღწერა აქ გამოჩნდება" },
  "partner.deepSynastry": { en: "Generate Deep Synastry", ka: "ღრმა სინასტრიის ანალიზი" },
  "partner.timeUnknown": { en: "Time unknown", ka: "საათი უცნობია" },
  "partner.placeOfBirth": { en: "Place of Birth", ka: "დაბადების ადგილი" },
  "partner.placeOfBirthPlaceholder": { en: "City, Country...", ka: "ქალაქი, ქვეყანა..." },

  // Edit Profile
  "profile.edit": { en: "Edit Profile", ka: "პროფილის რედაქტირება" },
  "profile.editTitle": { en: "Edit Profile", ka: "მონაცემების რედაქტირება" },
  "profile.name": { en: "Name", ka: "სახელი" },
  "profile.dob": { en: "Date of Birth", ka: "დაბადების თარიღი" },
  "profile.timeOfBirth": { en: "Time of Birth", ka: "დაბადების დრო" },
  "profile.timeUnknown": { en: "Time unknown", ka: "საათი უცნობია" },
  "profile.placeOfBirth": { en: "Place of Birth", ka: "დაბადების ადგილი" },
  "profile.placeOfBirthPlaceholder": { en: "City, Country...", ka: "ქალაქი, ქვეყანა..." },
  "profile.saveChanges": { en: "Save Changes", ka: "ცვლილებების შენახვა" },
  "profile.saving": { en: "Saving...", ka: "ინახება..." },
  "profile.updateSuccess": { en: "Profile updated successfully!", ka: "პროფილი წარმატებით განახლდა!" },
  "profile.discardTitle": { en: "Unsaved Changes", ka: "შეუნახავი ცვლილებები" },
  "profile.discardDescription": { en: "Changes will not be saved. Close?", ka: "ცვლილებები არ შეინახება. დახურვა?" },
  "profile.discardClose": { en: "Close", ka: "დახურვა" },
  "profile.discardContinue": { en: "Continue Editing", ka: "გაგრძელება" },
  "profile.updateError": { en: "Failed to update profile. Please try again.", ka: "პროფილის განახლება ვერ მოხერხდა. სცადეთ თავიდან." },

  // Privacy Policy Page
  "privacy.title": { en: "Privacy Policy", ka: "კონფიდენციალურობის პოლიტიკა (Privacy Policy)" },
  "privacy.effectiveDate": { en: "Last Updated: March 14, 2026", ka: "ბოლოს განახლდა: 14 მარტი, 2026" },
  "privacy.intro": {
    en: "Thank you for choosing Astrochat. Your privacy is important to us. This policy explains what information we collect, how we use it, and how we protect it.",
    ka: "მადლობას გიხდით, რომ იყენებთ Astrochat-ს. ჩვენთვის მნიშვნელოვანია თქვენი პირადი მონაცემების დაცვა. ეს დოკუმენტი განმარტავს, თუ რა ინფორმაციას ვაგროვებთ და როგორ ვიყენებთ მას."
  },
  "privacy.s1.title": { en: "1. Data Collection", ka: "1. მონაცემების შეგროვება" },
  "privacy.s1.text": {
    en: "We collect information that you provide directly to us when registering and using the app:",
    ka: "ჩვენ ვაგროვებთ ინფორმაციას, რომელსაც თავად გვაწვდით აპლიკაციაში რეგისტრაციისას და მისი გამოყენებისას:"
  },
  "privacy.s1.bullets": {
    en: "Account Data: Email address (for authentication purposes).|Astrological Data: Date of birth, exact time, and place of birth (required for generating personalized charts and forecasts).|Technical Data: IP address, device type, and operating system information.",
    ka: "ანგარიშის მონაცემები: ელექტრონული ფოსტა (ავტორიზაციისთვის).|ასტროლოგიური მონაცემები: დაბადების თარიღი, ზუსტი დრო და ადგილი (პირადი პროგნოზების შესადგენად).|ტექნიკური მონაცემები: IP მისამართი, მოწყობილობის ტიპი და ოპერაციული სისტემა."
  },
  "privacy.s2.title": { en: "2. How We Use Your Data", ka: "2. როგორ ვიყენებთ თქვენს მონაცემებს" },
  "privacy.s2.text": {
    en: "We use the collected information solely for the following purposes:",
    ka: "თქვენი მონაცემები გამოიყენება მხოლოდ შემდეგი მიზნებისთვის:"
  },
  "privacy.s2.bullets": {
    en: "To provide accurate astrological calculations and personalized content.|To manage your account and ensure security via email verification.|To improve our services and provide customer support.|To send essential service-related communications (e.g., password resets).",
    ka: "ზუსტი ასტროლოგიური გამოთვლებისა და პერსონალიზებული კონტენტის მოსამზადებლად.|ანგარიშის ვერიფიკაციისა და უსაფრთხოების უზრუნველსაყოფად.|სერვისის გაუმჯობესებისა და ტექნიკური მხარდაჭერისთვის.|მნიშვნელოვანი შეტყობინებების გამოსაგზავნად (მაგ. პაროლის აღდგენა)."
  },
  "privacy.s3.title": { en: "3. Third-Party Services", ka: "3. მესამე მხარის სერვისები" },
  "privacy.s3.text": {
    en: "We do not sell your personal data. To provide our services, we use trusted third-party providers:",
    ka: "ჩვენ არ ვყიდით თქვენს მონაცემებს. თუმცა, სერვისის სრულყოფილად მუშაობისთვის ვიყენებთ სანდო პარტნიორებს:"
  },
  "privacy.s3.bullets": {
    en: "Supabase: For database management and secure user authentication.|Resend.com: For delivering transactional and verification emails.|Apple App Store / Google Play Store: For processing In-App Purchases. We do not store or have access to your credit card information.",
    ka: "Supabase: მონაცემთა ბაზისა და ავტორიზაციის მართვისთვის.|Resend.com: სერვისული იმეილების გამოსაგზავნად.|Apple App Store / Google Play Store: გადახდების (In-App Purchases) დასამუშავებლად. ჩვენ არ გვაქვს წვდომა თქვენს საბანკო ბარათის მონაცემებზე."
  },
  "privacy.s4.title": { en: "4. Data Security", ka: "4. მონაცემთა უსაფრთხოება" },
  "privacy.s4.text": {
    en: "We implement industry-standard encryption and security measures to protect your data. Our infrastructure, powered by Supabase, follows strict security protocols. However, please be aware that no method of electronic transmission or storage is 100% secure.",
    ka: "ჩვენ ვიყენებთ თანამედროვე დაშიფვრის (Encryption) მეთოდებს თქვენი ინფორმაციის დასაცავად. Supabase-ის ინფრასტრუქტურა უზრუნველყოფს მონაცემთა შენახვის მაღალ სტანდარტს. მიუხედავად ამისა, გახსოვდეთ, რომ ინტერნეტით მონაცემთა გადაცემის არცერთი მეთოდი არ არის 100%-ით დაცული."
  },
  "privacy.s5.title": { en: "5. Your Rights", ka: "5. თქვენი უფლებები" },
  "privacy.s5.text": {
    en: "You have the right to access, update, or request the deletion of your personal data at any time. Upon account deletion, all your personal astrological information will be permanently removed from our databases.",
    ka: "თქვენ გაქვთ უფლება მოითხოვოთ თქვენი მონაცემების ნახვა, შესწორება ან სრული წაშლა. ანგარიშის წაშლის შემთხვევაში, თქვენი ყველა პერსონალური ასტროლოგიური მონაცემი ავტომატურად წაიშლება ჩვენი ბაზიდან."
  },
  "privacy.s6.title": { en: "6. Contact Us", ka: "6. დაგვიკავშირდით" },
  "privacy.s6.text": {
    en: "If you have any questions or concerns regarding this Privacy Policy, please contact us at:",
    ka: "კონფიდენციალურობასთან დაკავშირებული ნებისმიერი კითხვის შემთხვევაში, მოგვწერეთ:"
  },

  // Terms of Service Page
  "terms.title": { en: "Terms and Conditions", ka: "წესები და პირობები" },
  "terms.intro": {
    en: "Welcome to Astrochat. By using our application, you agree to follow and be bound by the following terms and conditions. Please read them carefully.",
    ka: "მოგესალმებით Astrochat-ში. ჩვენი აპლიკაციით სარგებლობისას თქვენ ეთანხმებით ქვემოთ მოცემულ წესებსა და პირობებს. გთხოვთ, ყურადღებით გაეცნოთ მათ."
  },
  "terms.s1.title": { en: "1. Disclaimer", ka: "1. პასუხისმგებლობის შეზღუდვა (Disclaimer)" },
  "terms.s1.text": {
    en: "Astrochat is designed strictly for entertainment purposes only. The astrological predictions, chats, and advice provided by the app do not constitute and are not a substitute for professional medical, psychological, legal, or financial advice. Any decisions you make based on information obtained through the app are your sole responsibility.",
    ka: "Astrochat შექმნილია მხოლოდ გასართობი მიზნებისთვის. აპლიკაციის მიერ მოწოდებული ასტროლოგიური პროგნოზები, ჩატები თუ რჩევები არ წარმოადგენს და არ ანაცვლებს პროფესიონალურ სამედიცინო, ფსიქოლოგიურ, იურიდიულ ან ფინანსურ კონსულტაციას. ნებისმიერი გადაწყვეტილება, რომელსაც მიიღებთ აპლიკაციაში მიღებული ინფორმაციის საფუძველზე, არის თქვენი პირადი პასუხისმგებლობა."
  },
  "terms.s2.title": { en: "2. Payments and Refund Policy", ka: "2. გადახდები და თანხის დაბრუნების პოლიტიკა" },
  "terms.s2.text": {
    en: "All paid services and refund details:",
    ka: "ფასიანი სერვისები და თანხის დაბრუნება:"
  },
  "terms.s2.bullets": {
    en: "Transactions: All paid services (In-App Purchases) are processed through the Apple App Store or Google Play Store.|Refunds: All transactions are final, and Astrochat does not issue refunds. Since payments are processed by third-party platforms (Apple/Google), their respective internal policies apply to all refund requests. Users must contact the relevant platform directly for any payment disputes.",
    ka: "ტრანზაქციები: ყველა ფასიანი სერვისი (In-App Purchases) ხორციელდება Apple App Store-ის ან Google Play Store-ის მეშვეობით.|რეფანდი (Refund): ყველა ტრანზაქცია საბოლოოა და Astrochat-ის მიერ თანხის დაბრუნება არ ხდება. ვინაიდან გადახდები მუშავდება მესამე მხარის (Apple/Google) მიერ, თანხის დაბრუნების საკითხებზე ვრცელდება მათი შიდა წესები და მომხმარებელმა უნდა მიმართოს შესაბამის პლატფორმას."
  },
  "terms.s3.title": { en: "3. Use of Service", ka: "3. სერვისის გამოყენება" },
  "terms.s3.text": {
    en: "Users agree to use the application for lawful purposes only. The following actions are strictly prohibited:",
    ka: "მომხმარებელი ვალდებულია გამოიყენოს აპლიკაცია მხოლოდ კანონიერი მიზნებისთვის. აკრძალულია:"
  },
  "terms.s3.bullets": {
    en: "Interfering with the app's operation or exploiting system vulnerabilities.|Creating accounts under another person's identity or providing false information.|Copying, distributing, or using the app's content for commercial purposes without our prior written consent.",
    ka: "აპლიკაციის მუშაობისთვის ხელის შეშლა ან სისტემური ხარვეზების ბოროტად გამოყენება.|სხვისი სახელით ანგარიშის შექმნა ან ყალბი მონაცემების მითითება.|აპლიკაციის შინაარსის კოპირება ან კომერციული მიზნებისთვის გამოყენება ჩვენი თანხმობის გარეშე."
  },
  "terms.s4.title": { en: "4. Intellectual Property", ka: "4. ინტელექტუალური საკუთრება" },
  "terms.s4.text": {
    en: "The design, logo, source code, text, and algorithms of Astrochat are the intellectual property of the company. Their use, distribution, or reproduction is strictly prohibited without explicit written permission from the copyright holder.",
    ka: "Astrochat-ის დიზაინი, ლოგო, პროგრამული კოდი, ტექსტები და ალგორითმები წარმოადგენს კომპანიის ინტელექტუალურ საკუთრებას. მათი გამოყენება, გავრცელება ან რეპროდუქცია აკრძალულია საავტორო უფლებების მფლობელის წერილობითი ნებართვის გარეშე."
  },
  "terms.s5.title": { en: "5. Data Protection", ka: "5. მონაცემთა დაცვა" },
  "terms.s5.text": {
    en: "Your data security is our priority. We utilize Supabase's encrypted systems to protect your authentication and personal information. For detailed information on how we handle your data, please refer to our Privacy Policy.",
    ka: `თქვენი მონაცემების უსაფრთხოება ჩვენთვის მნიშვნელოვანია. ჩვენ ვიყენებთ Supabase-ის დაშიფრულ სისტემებს თქვენი ავტორიზაციისა და პირადი ინფორმაციის დასაცავად. დეტალური ინფორმაციისთვის შეგიძლიათ გაეცნოთ ჩვენს „კონფიდენციალურობის პოლიტიკას".`
  },
  "terms.s6.title": { en: "6. Changes to Terms", ka: "6. წესების ცვლილებები" },
  "terms.s6.text": {
    en: "We reserve the right to modify these terms at any time. Information regarding changes will be updated within the app or sent via email. Continued use of the application following such changes constitutes your agreement to the updated terms.",
    ka: "ჩვენ ვიტოვებთ უფლებას, ნებისმიერ დროს შევიტანოთ ცვლილებები წინამდებარე წესებში. ცვლილებების შესახებ ინფორმაცია გამოქვეყნდება აპლიკაციაში ან გეცნობებათ იმეილის მეშვეობით. აპლიკაციის გამოყენების გაგრძელება ნიშნავს თქვენს თანხმობას განახლებულ პირობებზე."
  },
  "terms.s7.title": { en: "7. Contact Information", ka: "7. საკონტაქტო ინფორმაცია" },
  "terms.s7.text": {
    en: "If you have any questions regarding these terms, please contact us at:",
    ka: "კითხვების შემთხვევაში შეგიძლიათ დაგვიკავშირდეთ:"
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("astrochat_language");
    return (saved === "ka" || saved === "en") ? saved : "en";
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("astrochat_language", lang);
  }, []);

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
