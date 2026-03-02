import { ZodiacSign } from "./zodiac";

interface CompatibilityResult {
  score: number;
  level: "soulmate" | "great" | "good" | "challenging";
  strengthKeys: string[];
  challengeKeys: string[];
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

const strengthKeysMap: Record<string, string[]> = {
  soulmate: ["compat.str.deepEmotional", "compat.str.naturalChemistry", "compat.str.sharedValues"],
  great: ["compat.str.strongComm", "compat.str.complementary", "compat.str.excitingDynamic"],
  good: ["compat.str.mutualRespect", "compat.str.growthDifferences", "compat.str.balancedPerspectives"],
  challenging: ["compat.str.profoundGrowth", "compat.str.patience", "compat.str.resilience"],
};

const challengeKeysMap: Record<string, string[]> = {
  soulmate: ["compat.ch.tooComfortable", "compat.ch.individuality"],
  great: ["compat.ch.miscommunication", "compat.ch.differentPacing"],
  good: ["compat.ch.emotionalStyles", "compat.ch.extraEffort"],
  challenging: ["compat.ch.differentApproaches", "compat.ch.clashingTemperaments", "compat.ch.consciousCompromise"],
};

export function calculateCompatibility(
  sign1: ZodiacSign,
  sign2: ZodiacSign
): CompatibilityResult {
  let baseScore = elementCompat[sign1.element][sign2.element];

  if (signBonus[sign1.name]?.includes(sign2.name)) {
    baseScore = Math.min(100, baseScore + 10);
  }

  if (sign1.name === sign2.name) {
    baseScore = Math.max(baseScore, 75);
  }

  const score = baseScore;
  const level: CompatibilityResult["level"] =
    score >= 90 ? "soulmate" : score >= 75 ? "great" : score >= 60 ? "good" : "challenging";

  return {
    score,
    level,
    strengthKeys: strengthKeysMap[level],
    challengeKeys: challengeKeysMap[level],
  };
}
