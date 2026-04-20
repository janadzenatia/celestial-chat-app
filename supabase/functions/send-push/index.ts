import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { sendFcmNotification } from "../_shared/fcm.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { userId, title, body, kind, data } = await req.json();
    if (!userId || !title || !body || !kind) {
      return new Response(JSON.stringify({ error: "userId, title, body, kind required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("fcm_token, notifications_enabled")
      .eq("user_id", userId)
      .maybeSingle();

    if (profErr) throw profErr;
    if (!profile?.fcm_token) {
      return new Response(JSON.stringify({ ok: false, reason: "no_token" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (profile.notifications_enabled === false) {
      return new Response(JSON.stringify({ ok: false, reason: "disabled" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await sendFcmNotification({
      token: profile.fcm_token,
      title,
      body,
      data: data || {},
    });

    // Log result (idempotency via UNIQUE on user_id+send_date+kind)
    await supabase.from("push_send_log").upsert(
      {
        user_id: userId,
        kind,
        status: result.ok ? "sent" : "failed",
        fcm_message_id: result.messageId ?? null,
        error: result.error ?? null,
      },
      { onConflict: "user_id,send_date,kind" } as any,
    );

    // Cleanup invalid tokens so we don't keep retrying
    if (!result.ok && result.invalidToken) {
      await supabase
        .from("profiles")
        .update({ fcm_token: null, fcm_token_updated_at: new Date().toISOString() } as any)
        .eq("user_id", userId);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-push error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
