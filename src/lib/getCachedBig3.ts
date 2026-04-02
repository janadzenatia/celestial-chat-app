/**
 * Get the user's Big 3 signs from cached Supabase profile values.
 * Never recalculates client-side — values are set during onboarding/profile update only.
 */
export function getCachedBig3(profile: any): { sunSign: string; moonSign: string; risingSign: string } {
  return {
    sunSign: profile.cached_sun_sign || "Unknown",
    moonSign: profile.cached_moon_sign || "Unknown",
    risingSign: profile.cached_rising_sign || "Unknown",
  };
}
