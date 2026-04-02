import { getSunSign, getApproxMoonSign, getApproxRisingSign } from "@/lib/zodiac";

/**
 * Get the user's Big 3 signs, preferring cached values from the profile.
 * Falls back to client-side calculation only if cache is empty.
 */
export function getCachedBig3(profile: any): { sunSign: string; moonSign: string; risingSign: string } {
  if (profile.cached_sun_sign && profile.cached_moon_sign && profile.cached_rising_sign) {
    return {
      sunSign: profile.cached_sun_sign,
      moonSign: profile.cached_moon_sign,
      risingSign: profile.cached_rising_sign,
    };
  }

  // Fallback: recalculate (only until cache is populated on next login)
  const dob = profile.date_of_birth;
  if (!dob) return { sunSign: "Unknown", moonSign: "Unknown", risingSign: "Unknown" };

  return {
    sunSign: getSunSign(dob)?.name || "Unknown",
    moonSign: getApproxMoonSign(dob, profile.time_of_birth, profile.birth_lat ?? null, profile.birth_lon ?? null)?.name || "Unknown",
    risingSign: getApproxRisingSign(dob, profile.time_of_birth, profile.birth_lat ?? null, profile.birth_lon ?? null)?.name || "Unknown",
  };
}
