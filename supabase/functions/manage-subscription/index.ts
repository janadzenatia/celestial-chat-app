import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

import { validateAuth } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authResult = await validateAuth(req);
    if ("error" in authResult) return authResult.error;
    const { userId } = authResult;

    const { action } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (action === "activate") {
      // SECURITY: Premium activation is disabled until a real payment provider
      // (e.g. Stripe) is integrated. Activation must only happen from a verified
      // payment webhook, never from a direct client call.
      console.warn(`Blocked direct activate attempt by user ${userId}`);
      return new Response(JSON.stringify({ error: "Payment processing is not yet configured. Please contact support." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "cancel") {
      // Get profile info before updating
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, language_preference")
        .eq("user_id", userId)
        .single();

      // Get user email
      const { data: { user: authUser } } = await supabase.auth.admin.getUserById(userId);

      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_plan: "free",
          subscription_status: "free",
          is_premium: false,
        })
        .eq("user_id", userId);

      if (error) {
        console.error("Cancel error:", error);
        return new Response(JSON.stringify({ error: "Failed to cancel subscription" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Send cancellation email server-side
      if (authUser?.email) {
        try {
          await supabase.functions.invoke("send-transactional-email", {
            body: {
              templateName: "subscription-cancelled",
              recipientEmail: authUser.email,
              idempotencyKey: `sub-cancelled-${userId}-${Date.now()}`,
              templateData: {
                name: profile?.name || undefined,
                language: profile?.language_preference || "en",
              },
            },
          });
        } catch (emailErr) {
          console.error("Failed to send cancellation email:", emailErr);
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("manage-subscription error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
