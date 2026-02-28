import { ZodiacSign, getSunSign } from "./zodiac";

interface CompatibilityResult {
  score: number;
  level: "soulmate" | "great" | "good" | "challenging";
  summary: string;
  strengths: string[];
  challenges: string[];
}

// Element compatibility matrix
const elementCompat: Record<string, Record<string, number>> = {
  Fire:  { Fire: 80, Air: 90, Earth: 50, Water: 40 },
  Earth: { Fire: 50, Air: 60, Earth: 85, Water: 90 },
  Air:   { Fire: 90, Air: 80, Earth: 60, Water: 50 },
  Water: { Fire: 40, Air: 50, Earth: 90, Water: 85 },
};

// Sign-specific bonuses for classic pairings
const signBonus: Record<string, string[]> = {
  Aries:       ["Leo", "Sagittarius", "Libra"],
  Taurus:      ["Virgo", "Capricorn", "Cancer"],
  Gemini:      ["Libra", "Aquarius", "Sagittarius"],
  Cancer:      ["Scorpio", "Pisces", "Taurus"],
  Leo:         ["Aries", "Sagittarius", "Aquarius"],
  Virgo:       ["Taurus", "Capricorn", "Cancer"],
  Libra:       ["Gemini", "Aquarius", "Aries"],
  Scorpio:     ["Cancer", "Pisces", "Taurus"],
  Sagittarius: ["Aries", "Leo", "Gemini"],
  Capricorn:   ["Taurus", "Virgo", "Scorpio"],
  Aquarius:    ["Gemini", "Libra", "Leo"],
  Pisces:      ["Cancer", "Scorpio", "Capricorn"],
};

const strengthsMap: Record<string, string[]> = {
  soulmate: [
    "Deep emotional understanding",
    "Natural chemistry and attraction",
    "Shared values and life goals",
  ],
  great: [
    "Strong communication flow",
    "Complementary strengths",
    "Exciting dynamic energy",
  ],
  good: [
    "Mutual respect and admiration",
    "Growth through differences",
    "Balanced perspectives",
  ],
  challenging: [
    "Opportunity for profound growth",
    "Learning patience and compromise",
    "Building resilience together",
  ],
};

const challengesMap: Record<string, string[]> = {
  soulmate: ["May become too comfortable", "Need to maintain individuality"],
  great: ["Occasional miscommunication", "Different pacing in decisions"],
  good: ["Differing emotional styles", "Need extra effort to connect deeply"],
  challenging: ["Fundamentally different approaches", "Clashing temperaments", "Requires conscious compromise"],
};

export function calculateCompatibility(
  sign1: ZodiacSign,
  sign2: ZodiacSign
): CompatibilityResult {
  let baseScore = elementCompat[sign1.element][sign2.element];

  // Bonus for classic pairings
  if (signBonus[sign1.name]?.includes(sign2.name)) {
    baseScore = Math.min(100, baseScore + 10);
  }

  // Same sign bonus
  if (sign1.name === sign2.name) {
    baseScore = Math.max(baseScore, 75);
  }

  const score = baseScore;
  const level: CompatibilityResult["level"] =
    score >= 90 ? "soulmate" : score >= 75 ? "great" : score >= 60 ? "good" : "challenging";

  const summaries: Record<string, string> = {
    soulmate: `${sign1.emoji} ${sign1.name} and ${sign2.emoji} ${sign2.name} share a cosmic soulmate connection. The stars align beautifully for this pairing.`,
    great: `${sign1.emoji} ${sign1.name} and ${sign2.emoji} ${sign2.name} have a naturally strong bond. This is a dynamic and rewarding connection.`,
    good: `${sign1.emoji} ${sign1.name} and ${sign2.emoji} ${sign2.name} can build a solid relationship with mutual effort and understanding.`,
    challenging: `${sign1.emoji} ${sign1.name} and ${sign2.emoji} ${sign2.name} face cosmic tension, but great growth awaits those who persevere.`,
  };

  return {
    score,
    level,
    summary: summaries[level],
    strengths: strengthsMap[level],
    challenges: challengesMap[level],
  };
}
