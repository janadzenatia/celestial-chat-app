// Zodiac sign data with date ranges, emojis, and elements
export interface ZodiacSign {
  name: string;
  emoji: string;
  element: "Fire" | "Earth" | "Air" | "Water";
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
}

const signs: ZodiacSign[] = [
  { name: "Capricorn", emoji: "♑", element: "Earth", startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
  { name: "Aquarius", emoji: "♒", element: "Air", startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
  { name: "Pisces", emoji: "♓", element: "Water", startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
  { name: "Aries", emoji: "♈", element: "Fire", startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
  { name: "Taurus", emoji: "♉", element: "Earth", startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
  { name: "Gemini", emoji: "♊", element: "Air", startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
  { name: "Cancer", emoji: "♋", element: "Water", startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
  { name: "Leo", emoji: "♌", element: "Fire", startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
  { name: "Virgo", emoji: "♍", element: "Earth", startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
  { name: "Libra", emoji: "♎", element: "Air", startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
  { name: "Scorpio", emoji: "♏", element: "Water", startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
  { name: "Sagittarius", emoji: "♐", element: "Fire", startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
];

/**
 * Get the Sun sign from a date of birth string (YYYY-MM-DD)
 */
export function getSunSign(dateOfBirth: string): ZodiacSign | null {
  if (!dateOfBirth) return null;
  const date = new Date(dateOfBirth + "T12:00:00");
  const month = date.getMonth() + 1;
  const day = date.getDate();

  for (const sign of signs) {
    if (sign.startMonth === 12 && sign.endMonth === 1) {
      // Capricorn wraps around year
      if ((month === 12 && day >= sign.startDay) || (month === 1 && day <= sign.endDay)) {
        return sign;
      }
    } else if (
      (month === sign.startMonth && day >= sign.startDay) ||
      (month === sign.endMonth && day <= sign.endDay)
    ) {
      return sign;
    }
  }
  return null;
}

/**
 * Approximate Moon sign using a simplified lunar cycle calculation.
 * This is an approximation — real Moon sign requires an ephemeris.
 */
export function getApproxMoonSign(dateOfBirth: string): ZodiacSign {
  const date = new Date(dateOfBirth + "T12:00:00");
  // Simplified: Moon moves ~13.2° per day, completes zodiac in ~27.3 days
  // Using a known new moon in Aries as reference: Jan 1, 2000
  const refDate = new Date("2000-01-06T12:00:00"); // Moon was in Aries
  const diffDays = (date.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24);
  const moonCycleDays = 27.3216;
  const position = ((diffDays % moonCycleDays) + moonCycleDays) % moonCycleDays;
  const signIndex = Math.floor((position / moonCycleDays) * 12) % 12;
  // Offset by 3 because reference was Aries (index 3 in our array)
  return signs[(signIndex + 3) % 12];
}

/**
 * Approximate Rising sign using birth time and date.
 * This is a rough approximation — real Rising sign requires exact coordinates.
 */
export function getApproxRisingSign(dateOfBirth: string, timeOfBirth: string | null): ZodiacSign {
  const sunSign = getSunSign(dateOfBirth);
  const sunIndex = sunSign ? signs.findIndex(s => s.name === sunSign.name) : 0;

  if (!timeOfBirth) {
    // Without birth time, use sun sign as fallback
    return signs[sunIndex];
  }

  const [hours, minutes] = timeOfBirth.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes;
  // Rising sign changes every ~2 hours, full cycle in 24h
  const risingOffset = Math.floor((totalMinutes / 120)) % 12;
  return signs[(sunIndex + risingOffset) % 12];
}

/**
 * Daily horoscope insights per sign element
 */
const insightsByElement: Record<string, string[]> = {
  Fire: [
    "Your fiery energy blazes through obstacles today. Channel your passion into creative ventures.",
    "A spark of inspiration arrives unexpectedly. Let your natural courage guide bold decisions.",
    "The cosmos amplifies your leadership today. Others are drawn to your radiant confidence.",
  ],
  Earth: [
    "Grounding energy surrounds you. Focus on practical steps that build lasting foundations.",
    "Material blessings are highlighted today. Trust your instincts about financial matters.",
    "Patience is your superpower now. Slow, steady progress leads to remarkable outcomes.",
  ],
  Air: [
    "Your mind is exceptionally sharp today. New ideas flow freely — capture them before they vanish.",
    "Communication channels open wide. A meaningful conversation could change your perspective.",
    "Social connections bring unexpected joy. Reach out to someone you've been thinking about.",
  ],
  Water: [
    "Your intuition runs deep today. Trust the feelings that arise without overthinking them.",
    "Emotional healing is available now. Allow yourself the space to process and release.",
    "Creative and spiritual energies merge beautifully. Express your innermost visions.",
  ],
};

export function getDailyInsight(sunSign: ZodiacSign | null): string {
  const element = sunSign?.element ?? "Fire";
  const insights = insightsByElement[element];
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  return insights[dayOfYear % insights.length];
}
