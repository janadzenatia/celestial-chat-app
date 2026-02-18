

# Astrochat — Your Personal AI Astrologer 🌟

A premium, bilingual (English/Georgian) AI Astrology mobile-first PWA with a "Mystical Modern" dark theme.

---

## Phase 1: Design Foundation & App Shell

Set up the entire visual identity and navigation structure:

- **Dark-only "Mystical Modern" theme** — Deep Midnight Blue background, Stardust Gold accents, Mystic Purple gradients
- **Glassmorphism card/input styling** throughout the app
- **Typography** — Playfair Display for headings, clean sans-serif for body
- **Fixed bottom navigation bar** with 4 tabs: Home, Chat, Compatibility, Profile
- **PWA setup** — manifest.json, service worker, "Add to Home Screen" prompt
- **Bilingual engine** — Language toggle (ENG/GEO) with context-based text switching across all screens

---

## Phase 2: Authentication & Onboarding

Connect Supabase for auth and user data:

- **Splash screen** — Minimalist logo (chat bubble + star) with tagline "Your Personal AI Astrologer"
- **Login / Sign Up** via Supabase Auth (email + password)
- **Terms checkbox** on sign-up: "I agree to the Terms & Conditions and understand this app is for entertainment purposes only"
- **Onboarding flow** after first signup — collect Name, Date of Birth, Exact Time of Birth, Place of Birth
- **Profiles table** in Supabase to store user birth data, language preference, and premium status

---

## Phase 3: Dashboard (Home Tab)

The main landing experience after login:

- **Header** with logo (left) and Language Toggle [ENG | GEO] (right)
- **"Big 3" Card** — Display user's Sun, Moon, and Rising signs with icons/visuals, calculated from birth date using placeholder zodiac logic
- **Daily Insight Card** — A daily horoscope summary snippet (can be static/rotating text initially, later AI-generated)

---

## Phase 4: AI Chat — "Ask the Stars"

The core conversational feature:

- **Chat UI** styled like iMessage/WhatsApp but with the mystical glassmorphism theme
- **Lovable AI integration** via edge function with a system prompt: witty, empathetic astrologer persona that responds based on the user's zodiac sign and selected language
- **Streaming responses** for a real-time feel
- **Disclaimer** below input: "AI advice is for entertainment only. Not medical/legal advice."
- **Message history** persisted in Supabase per user

---

## Phase 5: Freemium Logic & Premium Modal

Monetization gating:

- **Free tier**: 3 chat messages per day (tracked in Supabase)
- **4th message behavior**: Show a blurred/locked response and trigger the Premium Modal
- **Compatibility tab**: Locked for free users, clicking opens Premium Modal
- **Premium Modal** — visually striking with:
  - Headline: "Unlock Your Cosmic Destiny"
  - Monthly plan: 9.99 GEL/month
  - Quarterly plan: 19.99 GEL/3 months with "Save 33%" badge (highlighted)
  - "Upgrade Now" button linking to a placeholder URL (for future Lemon Squeezy integration)

---

## Phase 6: Compatibility Tab & Profile

Remaining tabs:

- **Compatibility tab** (premium only) — Enter a partner's zodiac sign or birth date, get an AI-powered compatibility reading
- **Profile tab** — View/edit birth details, manage language preference, see subscription status
- **Legal/Settings section** with disclaimer: "Astrochat is for entertainment purposes only. Not a substitute for professional advice."

