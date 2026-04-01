import { getSunSign, getApproxMoonSign, getApproxRisingSign } from "@/lib/zodiac";

/**
 * Get the user's Big 3 signs, preferring cached values from the profile.
 * Only recalculates if ALL three cached values are missing.
 */
export function getCachedBig3(profile: any): { sunSign: string; moonSign: string; risingSign: string } {
  const hasCached = profile.cached_sun_sign && profile.cached_moon_sign && profile.cached_rising_sign;

  if (hasCached) {
    return {
      sunSign: profile.cached_sun_sign,
      moonSign: profile.cached_moon_sign,
      risingSign: profile.cached_rising_sign,
    };
  }

  // Fallback: recalculate (should only happen for very old accounts)
  const dob = profile.date_of_birth;
  if (!dob) return { sunSign: "Unknown", moonSign: "Unknown", risingSign: "Unknown" };

  const tob = profile.time_of_birth;
  const birthLat = profile.birth_lat ?? null;
  const birthLon = profile.birth_lon ?? null;

  return {
    sunSign: getSunSign(dob)?.name || "Unknown",
    moonSign: getApproxMoonSign(dob, tob, birthLat, birthLon)?.name || "Unknown",
    risingSign: getApproxRisingSign(dob, tob, birthLat, birthLon)?.name || "Unknown",
  };
}
