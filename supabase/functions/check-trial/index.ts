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
    const { device_id } = await req.json();

    if (!device_id) {
      return new Response(JSON.stringify({ trial_available: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if this device has already used a trial
    const { data } = await adminClient
      .from("trial_history")
      .select("id")
      .eq("device_id", device_id)
      .eq("trial_used", true)
      .limit(1);

    const trialAvailable = !data || data.length === 0;

    return new Response(JSON.stringify({ trial_available: trialAvailable }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Check trial error:", err);
    return new Response(JSON.stringify({ trial_available: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
