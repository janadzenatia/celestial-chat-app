import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

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
}

/** Derive the effective plan considering trial expiry and legacy fields */
export function getEffectivePlan(profile: Profile | null): "free" | "basic_premium" | "pro_premium" {
  if (!profile) return "free";
  const plan = profile.subscription_plan;
  if (plan === "pro_premium" && profile.trial_end_date) {
    if (new Date(profile.trial_end_date) < new Date()) {
      // Trial expired — fall back to legacy check or free
      if (profile.is_premium || profile.subscription_status === "premium") return "pro_premium";
      return "free";
    }
  }
  if (plan === "basic_premium" || plan === "pro_premium") return plan as any;
  // Legacy backward compatibility: old users with is_premium/subscription_status but no subscription_plan
  if (profile.is_premium || profile.subscription_status === "premium") return "pro_premium";
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
    setProfile(data as Profile | null);
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
