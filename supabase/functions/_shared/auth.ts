import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AuthResult {
  userId: string;
  error?: never;
}

interface AuthError {
  userId?: never;
  error: Response;
}

/**
 * Validates the JWT from the Authorization header and returns the user ID.
 */
export async function validateAuth(req: Request): Promise<AuthResult | AuthError> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      error: new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }),
    };
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims) {
    return {
      error: new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }),
    };
  }

  return { userId: data.claims.sub as string };
}

/**
 * Checks if a user has an active premium subscription.
 * Returns a 402 Response if not premium, or null if premium.
 */
export async function requirePremium(userId: string): Promise<Response | null> {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_premium, subscription_plan, trial_end_date")
    .eq("user_id", userId)
    .single();

  if (!profile) {
    return new Response(JSON.stringify({ error: "Profile not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Check if user has premium access: is_premium flag, paid plan, or active trial
  const hasPaidPlan = profile.subscription_plan !== "free";
  const hasActiveTrial = profile.trial_end_date && new Date(profile.trial_end_date) > new Date();
  const isPremium = profile.is_premium || hasPaidPlan || hasActiveTrial;

  if (!isPremium) {
    return new Response(JSON.stringify({ error: "Premium subscription required" }), {
      status: 402,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return null;
}
