import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { geocodePlace } from "@/lib/geocoding";
import { getDeviceId } from "@/lib/deviceId";

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

    // Save device_id to profile if not already set
    if (prof && !prof.device_id) {
      const deviceId = getDeviceId();
      await supabase
        .from("profiles")
        .update({ device_id: deviceId } as any)
        .eq("user_id", userId);
    }

    // Auto-geocode existing users who have place_of_birth but no coordinates
    if (prof && prof.place_of_birth && prof.birth_lat == null) {
      const coords = await geocodePlace(prof.place_of_birth);
      if (coords) {
        await supabase
          .from("profiles")
          .update({
            birth_lat: coords.lat,
            birth_lon: coords.lon,
            birth_place_normalized: coords.displayName,
          } as any)
          .eq("user_id", userId);
        setProfile({ ...prof, birth_lat: coords.lat, birth_lon: coords.lon, birth_place_normalized: coords.displayName });
      }
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          // Use setTimeout to avoid potential deadlock with Supabase auth
          setTimeout(() => fetchProfile(session.user.id), 0);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
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
