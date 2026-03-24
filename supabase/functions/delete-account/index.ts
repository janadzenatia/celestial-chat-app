import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No auth header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the user
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const userId = user.id;
    const userEmail = user.email || "";
    const emailHash = await hashEmail(userEmail);

    // Get profile to capture device_id and name before deletion
    const { data: profile } = await adminClient
      .from("profiles")
      .select("device_id, trial_end_date")
      .eq("user_id", userId)
      .single();

    // Record trial usage in trial_history (if not already recorded)
    const { data: existingHistory } = await adminClient
      .from("trial_history")
      .select("id")
      .eq("email_hash", emailHash)
      .limit(1);

    if (!existingHistory || existingHistory.length === 0) {
      await adminClient.from("trial_history").insert({
        email_hash: emailHash,
        device_id: profile?.device_id || null,
        trial_used: true,
        trial_start_date: new Date().toISOString(),
        trial_end_date: profile?.trial_end_date || null,
      });
    }

    // Also record device_id if present and not already tracked
    if (profile?.device_id) {
      const { data: deviceHistory } = await adminClient
        .from("trial_history")
        .select("id")
        .eq("device_id", profile.device_id)
        .limit(1);

      if (!deviceHistory || deviceHistory.length === 0) {
        await adminClient.from("trial_history").insert({
          email_hash: emailHash,
          device_id: profile.device_id,
          trial_used: true,
          trial_start_date: new Date().toISOString(),
          trial_end_date: profile?.trial_end_date || null,
        });
      }
    }

    // Delete all user data from all tables
    const tables = [
      "chat_messages",
      "child_reports",
      "children",
      "cosmic_calendars",
      "cosmic_matches",
      "daily_insights",
      "relationship_forecasts",
      "synastry_reports",
      "wealth_reports",
      "cosmic_hooks",
      "profiles",
    ];

    for (const table of tables) {
      await adminClient.from(table).delete().eq("user_id", userId);
    }

    // Delete the auth user
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error("Error deleting auth user:", deleteError);
      return new Response(JSON.stringify({ error: "Failed to delete account" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Delete account error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function hashEmail(email: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(email.toLowerCase());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
