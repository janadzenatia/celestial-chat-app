// @ts-ignore — tz-lookup has no type declarations
import tzlookup from "tz-lookup";

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

// Sign lookup by ecliptic longitude (0° = Aries)
const signsByLongitude: ZodiacSign[] = [
  signs[3], // Aries 0-30
  signs[4], // Taurus 30-60
  signs[5], // Gemini 60-90
  signs[6], // Cancer 90-120
  signs[7], // Leo 120-150
  signs[8], // Virgo 150-180
  signs[9], // Libra 180-210
  signs[10], // Scorpio 210-240
  signs[11], // Sagittarius 240-270
  signs[0], // Capricorn 270-300
  signs[1], // Aquarius 300-330
  signs[2], // Pisces 330-360
];

// ─── Utility math ───────────────────────────────────────────
function norm360(deg: number): number {
  return ((deg % 360) + 360) % 360;
}
function sinD(d: number): number {
  return Math.sin((d * Math.PI) / 180);
}
function cosD(d: number): number {
  return Math.cos((d * Math.PI) / 180);
}
function tanD(d: number): number {
  return Math.tan((d * Math.PI) / 180);
}

// ─── Timezone-aware UTC conversion (luxon for historical accuracy) ───

import { DateTime } from "luxon";

/**
 * Get UTC offset in minutes for a specific local datetime in a given IANA timezone.
 * Uses luxon — correctly handles DST, historical timezone changes, and
 * Soviet-era time zones for any country.
 * Returns minutes to ADD to local time to get UTC (negative for east of Greenwich).
 */
function getTimezoneOffsetMinutes(
  timeZone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): number {
  const dt = DateTime.fromObject({ year, month, day, hour, minute }, { zone: timeZone });
  // dt.offset is minutes east of UTC (positive for east), we need the inverse
  return -dt.offset;
}

/**
 * Convert local birth date/time to Julian Day number using proper IANA timezone
 * resolution when coordinates are available. Falls back to browser timezone.
 *
 * This is the SINGLE source of truth for birth-time → UTC conversion across
 * all astrological calculations (Moon, Ascendant, houses, etc.).
 */
function birthTimeToJD(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  lat?: number | null,
  lon?: number | null,
): number {
  let offsetMinutes: number;

  if (lat != null && lon != null) {
    try {
      const tz = tzlookup(lat, lon); // e.g. "Asia/Tbilisi", "America/New_York"
      offsetMinutes = getTimezoneOffsetMinutes(tz, year, month, day, hour, minute);
    } catch {
      // Fallback: rough estimate from longitude (4 minutes per degree)
      offsetMinutes = -(lon * 4);
    }
  } else {
    // No coordinates — use the browser's local timezone
    offsetMinutes = new Date(year, month - 1, day, hour, minute).getTimezoneOffset();
  }

  // Convert total local time to UTC fractional hours
  const totalUtcMinutes = hour * 60 + minute + offsetMinutes;
  const utcFractionalHours = totalUtcMinutes / 60;

  return toJulianDay(year, month, day, utcFractionalHours, 0);
}

/**
 * Convert calendar date/time to Julian Day number
 */
function toJulianDay(year: number, month: number, day: number, hour: number, minute: number): number {
  const h = hour + minute / 60;
  let y = year,
    m = month;
  if (m <= 2) {
    y--;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + h / 24 + B - 1524.5;
}

/**
 * Accurate Moon ecliptic longitude using Meeus Chapter 47
 * Returns degrees (0-360)
 */
function getMoonLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;

  // Fundamental arguments (degrees)
  const Lp = norm360(218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + T3 / 538841 - T4 / 65194000);
  const D = norm360(297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + T3 / 545868 - T4 / 113065000);
  const M = norm360(357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000);
  const Mp = norm360(134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3 / 69699 - T4 / 14712000);
  const F = norm360(93.272095 + 483202.0175233 * T - 0.0036539 * T2 - T3 / 3526000 + T4 / 863310000);

  const A1 = norm360(119.75 + 131.849 * T);
  const A2 = norm360(53.09 + 479264.29 * T);

  let E = 1 - 0.002516 * T - 0.0000074 * T2;
  const E2 = E * E;

  // Periodic terms for longitude (Meeus Table 47.A — top ~50 terms)
  const lonTerms: [number, number, number, number, number][] = [
    [0, 0, 1, 0, 6288774],
    [2, 0, -1, 0, 1274027],
    [2, 0, 0, 0, 658314],
    [0, 0, 2, 0, 213618],
    [0, 1, 0, 0, -185116],
    [0, 0, 0, 2, -114332],
    [2, 0, -2, 0, 58793],
    [2, -1, -1, 0, 57066],
    [2, 0, 1, 0, 53322],
    [2, -1, 0, 0, 45758],
    [0, 1, -1, 0, -40923],
    [1, 0, 0, 0, -34720],
    [0, 1, 1, 0, -30383],
    [2, 0, 0, -2, 15327],
    [0, 0, 1, 2, -12528],
    [0, 0, 1, -2, 10980],
    [4, 0, -1, 0, 10675],
    [0, 0, 3, 0, 10034],
    [4, 0, -2, 0, 8548],
    [2, 1, -1, 0, -7888],
    [2, 1, 0, 0, -6766],
    [1, 0, -1, 0, -5163],
    [1, 1, 0, 0, 4987],
    [2, -1, 1, 0, 4036],
    [2, 0, 2, 0, 3994],
    [4, 0, 0, 0, 3861],
    [2, 0, -3, 0, 3665],
    [0, 1, -2, 0, -2689],
    [2, 0, -1, 2, -2602],
    [2, -1, -2, 0, 2390],
    [1, 0, 1, 0, -2348],
    [2, -2, 0, 0, 2236],
    [0, 1, 2, 0, -2120],
    [0, 2, 0, 0, -2069],
    [2, -2, -1, 0, 2048],
    [2, 0, 1, -2, -1773],
    [2, 0, 0, 2, -1595],
    [4, -1, -1, 0, 1215],
    [0, 0, 2, 2, -1110],
    [3, 0, -1, 0, -892],
    [2, 1, 1, 0, -810],
    [4, -1, -2, 0, 759],
    [0, 2, -1, 0, -713],
    [2, 2, -1, 0, -700],
    [2, 1, -2, 0, 691],
    [2, -1, 0, -2, 596],
    [4, 0, 1, 0, 549],
    [0, 0, 4, 0, 537],
    [4, -1, 0, 0, 520],
    [1, 0, -2, 0, -487],
  ];

  let SigmaL = 0;
  for (const [d, m, mp, f, coeff] of lonTerms) {
    let c = coeff;
    if (Math.abs(m) === 1) c *= E;
    if (Math.abs(m) === 2) c *= E2;
    SigmaL += c * sinD(d * D + m * M + mp * Mp + f * F);
  }

  SigmaL += 3958 * sinD(A1) + 1962 * sinD(Lp - F) + 318 * sinD(A2);

  return norm360(Lp + SigmaL / 1000000);
}

/**
 * Obliquity of the ecliptic (Meeus)
 */
function getObliquity(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  return 23.4392911 - 0.0130042 * T - 0.00000016 * T * T;
}

/**
 * Greenwich Mean Sidereal Time in degrees
 */
function getGMST(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  return norm360(280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - (T * T * T) / 38710000);
}

/**
 * Ascendant ecliptic longitude using birth time and geographic coordinates
 */
function getAscendantLon(jd: number, latDeg: number, lonDeg: number): number {
  const gmst = getGMST(jd);
  const lst = norm360(gmst + lonDeg);
  const eps = getObliquity(jd);
  const ascRad = Math.atan2(cosD(lst), -(sinD(lst) * cosD(eps) + tanD(latDeg) * sinD(eps)));
  return norm360((ascRad * 180) / Math.PI);
}

function longitudeToSign(lon: number): ZodiacSign {
  const idx = Math.floor(norm360(lon) / 30) % 12;
  return signsByLongitude[idx];
}

// ─── Public API ─────────────────────────────────────────────

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
      if ((month === 12 && day >= sign.startDay) || (month === 1 && day <= sign.endDay)) return sign;
    } else if ((month === sign.startMonth && day >= sign.startDay) || (month === sign.endMonth && day <= sign.endDay)) {
      return sign;
    }
  }
  return null;
}

/**
 * Accurate Moon sign using Meeus lunar ephemeris.
 * Uses proper IANA timezone resolution when birth coordinates are available.
 */
export function getApproxMoonSign(
  dateOfBirth: string,
  timeOfBirth?: string | null,
  birthLat?: number | null,
  birthLon?: number | null,
): ZodiacSign {
  const [year, month, day] = dateOfBirth.split("-").map(Number);

  let hours = 12,
    minutes = 0;
  if (timeOfBirth) {
    const parts = timeOfBirth.split(":").map(Number);
    hours = parts[0] ?? 12;
    minutes = parts[1] ?? 0;
  }

  const jd = birthTimeToJD(year, month, day, hours, minutes, birthLat, birthLon);
  const moonLon = getMoonLongitude(jd);
  return longitudeToSign(moonLon);
}

/**
 * Rising (Ascendant) sign using astronomical calculation.
 * Requires birth time AND coordinates for accuracy.
 *
 * FIX: Returns null when birth time is unknown.
 * Previously returned Sun sign as fallback — this was WRONG and caused
 * the Big 3 display to show the same sign for both Sun and Rising.
 */
export function getApproxRisingSign(
  dateOfBirth: string,
  timeOfBirth: string | null,
  birthLat?: number | null,
  birthLon?: number | null,
): ZodiacSign | null {
  // FIX: No birth time = Rising is unknown. Return null, not Sun sign.
  if (!timeOfBirth) {
    return null;
  }

  const [year, month, day] = dateOfBirth.split("-").map(Number);
  const [hours, minutes] = timeOfBirth.split(":").map(Number);

  const jd = birthTimeToJD(year, month, day, hours, minutes, birthLat, birthLon);

  const lat = birthLat ?? 42;
  const lon = birthLon ?? 0;

  const ascLon = getAscendantLon(jd, lat, lon);
  return longitudeToSign(ascLon);
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
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24),
  );
  return insights[dayOfYear % insights.length];
}
