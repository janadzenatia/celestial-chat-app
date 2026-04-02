import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { geocodePlace } from "@/lib/geocoding";
import { getDeviceId } from "@/lib/deviceId";
import { getSunSign, getApproxMoonSign, getApproxRisingSign } from "@/lib/zodiac";


interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  date_of_birth: string | null;
  time_of_birth: string | null;
  place_of_birth: string | null;
  language_preference: string;
  is_premium: boolean;
  onboarding_completed: boolean;
  subscription_status: string;
  subscription_plan: string;
  trial_end_date: string | null;
  daily_chat_count: number;
  last_chat_date: string | null;
  partner_name: string | null;
  partner_birth_date: string | null;
  partner_love_language: string | null;
  partner_time_of_birth: string | null;
  partner_place_of_birth: string | null;
  relationship_start_date: string | null;
  birth_lat: number | null;
  birth_lon: number | null;
  birth_place_normalized: string | null;
  device_id: string | null;
  cached_sun_sign: string | null;
  cached_moon_sign: string | null;
  cached_rising_sign: string | null;
  cached_sun_emoji: string | null;
  cached_moon_emoji: string | null;
  cached_rising_emoji: string | null;
}

/** Derive the effective plan: "free" or "premium" (single tier) */
export function getEffectivePlan(profile: Profile | null): "free" | "premium" {
  if (!profile) return "free";
  const plan = profile.subscription_plan;

  // Active paid subscriber (any non-free plan)
  if (plan && plan !== "free") {
    // Check if it's a trial that expired
    if (profile.trial_end_date && new Date(profile.trial_end_date) < new Date()) {
      // Trial expired — check if they have a real subscription
      if (profile.is_premium || profile.subscription_status === "premium") return "premium";
      return "free";
    }
    return "premium";
  }

  // Legacy backward compatibility
  if (profile.is_premium || profile.subscription_status === "premium") return "premium";
  return "free";
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    const prof = data as Profile | null;
    setProfile(prof);

    // Fire-and-forget side effects — never block auth flow
    if (prof) {
      // Save device_id if not set
      if (!prof.device_id) {
        const deviceId = getDeviceId();
        supabase.from("profiles").update({ device_id: deviceId } as any).eq("user_id", userId).then(() => {});
      }

      // Auto-geocode if needed
      if (prof.place_of_birth && prof.birth_lat == null) {
        geocodePlace(prof.place_of_birth).then((coords) => {
          if (coords) {
            supabase.from("profiles").update({
              birth_lat: coords.lat, birth_lon: coords.lon, birth_place_normalized: coords.displayName,
            } as any).eq("user_id", userId).then(() => {});
            setProfile((prev) => prev ? { ...prev, birth_lat: coords.lat, birth_lon: coords.lon, birth_place_normalized: coords.displayName } : prev);
          }
        });
      }

      // Big 3 values are calculated ONLY during onboarding/profile update
      // via edge functions with proper timezone handling. Never recalculate client-side.
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    // IMPORTANT: Restore session FIRST, then subscribe to changes
    // This prevents the race condition where onAuthStateChange fires
    // before session is restored, causing false sign-outs.
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          // Fire and forget — never await inside this callback
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });

      // After successful signup, check device ID for trial abuse
      if (!error && data?.user) {
        const deviceId = getDeviceId();
        try {
          const { data: checkData } = await supabase.functions.invoke("check-trial", {
            body: { device_id: deviceId },
          });
          // If device already used trial, revoke it by updating profile
          if (checkData && !checkData.trial_available) {
            // Use a small delay to let the trigger create the profile first
            setTimeout(async () => {
              await supabase
                .from("profiles")
                .update({ device_id: deviceId } as any)
                .eq("user_id", data.user!.id);
            }, 1000);
          } else {
            // Save device_id for future tracking
            setTimeout(async () => {
              await supabase
                .from("profiles")
                .update({ device_id: deviceId } as any)
                .eq("user_id", data.user!.id);
            }, 1000);
          }
        } catch (e) {
          console.error("Trial check failed:", e);
        }
      }

      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
