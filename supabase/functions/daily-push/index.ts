import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Hourly orchestrator: finds users where their local hour == TARGET_HOUR
// and dispatches one push per user per day.
// Free users    -> daily-insight content (Phrase of the Day)
// Premium users -> cosmic-hook content

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TARGET_HOUR = 9; // 9 AM local time
const PUSH_KIND = "daily"; // single kind per day for idempotency

function localHourFor(tz: string | null): number | null {
  try {
    const zone = tz || "UTC";
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      hour: "numeric",
      hour12: false,
    });
    const parts = fmt.formatToParts(new Date());
    const hourPart = parts.find((p) => p.type === "hour")?.value;
    return hourPart != null ? parseInt(hourPart, 10) : null;
  } catch {
    return null;
  }
}

function localDateFor(tz: string | null): string {
  try {
    const zone = tz || "UTC";
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return fmt.format(new Date()); // YYYY-MM-DD
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

function isPremium(p: any): boolean {
  if (!p) return false;
  if (p.subscription_plan && p.subscription_plan !== "free") {
    if (p.trial_end_date && new Date(p.trial_end_date) < new Date()) {
      return !!(p.is_premium || p.subscription_status === "premium");
    }
    return true;
  }
  return !!(p.is_premium || p.subscription_status === "premium");
}

const TITLES = {
  hook: { en: "✨ Your Cosmic Alert", ka: "✨ კოსმიური შეტყობინება" },
  insight: { en: "🌙 Phrase of the Day", ka: "🌙 დღის ფრაზა" },
  fallbackHook: {
    en: "Tap to discover today's cosmic alert.",
    ka: "შეეხე და გაიგე დღევანდელი კოსმიური შეტყობინება.",
  },
  fallbackInsight: {
    en: "Tap to read your daily phrase from the stars.",
    ka: "შეეხე და წაიკითხე ვარსკვლავების შენი დღის ფრაზა.",
  },
};

function truncate(s: string, max = 240): string {
  if (!s) return s;
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let scanned = 0;
  let queued = 0;
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  try {
    // Pull all eligible recipients (small enough to page in memory).
    const { data: recipients, error } = await supabase
      .from("profiles")
      .select(
        "user_id, fcm_token, timezone, language_preference, subscription_plan, subscription_status, is_premium, trial_end_date",
      )
      .eq("notifications_enabled", true)
      .not("fcm_token", "is", null);

    if (error) throw error;
    scanned = recipients?.length ?? 0;

    for (const r of recipients ?? []) {
      const hour = localHourFor(r.timezone);
      if (hour !== TARGET_HOUR) {
        skipped++;
        continue;
      }
      const sendDate = localDateFor(r.timezone);

      // Idempotency: skip if already sent today (in user's local day)
      const { data: existing } = await supabase
        .from("push_send_log")
        .select("id, status")
        .eq("user_id", r.user_id)
        .eq("send_date", sendDate)
        .eq("kind", PUSH_KIND)
        .eq("status", "sent")
        .maybeSingle();
      if (existing) {
        skipped++;
        continue;
      }

      queued++;
      const lang = (r.language_preference === "ka" ? "ka" : "en") as "en" | "ka";
      const premium = isPremium(r);

      let title: string;
      let body: string;

      if (premium) {
        // Premium → cosmic-hook for today
        const { data: hook } = await supabase
          .from("cosmic_hooks")
          .select("hook")
          .eq("user_id", r.user_id)
          .eq("hook_date", sendDate)
          .eq("language", lang)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        title = TITLES.hook[lang];
        body = hook?.hook ? truncate(hook.hook) : TITLES.fallbackHook[lang];
      } else {
        // Free → daily-insight for today
        const { data: insights } = await supabase
          .from("daily_insights")
          .select("content")
          .eq("user_id", r.user_id)
          .eq("insight_date", sendDate)
          .eq("language", lang)
          .order("created_at", { ascending: false })
          .limit(5);

        // strip "[morning]" / "[evening]" prefix used by useDailyInsight cache
        const raw = insights?.[0]?.content?.replace(/^\[[a-z]+\]/i, "") ?? "";
        title = TITLES.insight[lang];
        body = raw ? truncate(raw) : TITLES.fallbackInsight[lang];
      }

      try {
        const { data: sendRes, error: sendErr } = await supabase.functions.invoke("send-push", {
          body: {
            userId: r.user_id,
            title,
            body,
            kind: PUSH_KIND,
            data: { kind: PUSH_KIND, plan: premium ? "premium" : "free" },
          },
        });
        if (sendErr) {
          failed++;
          console.error("send-push invoke error:", sendErr);
        } else if ((sendRes as any)?.ok) {
          sent++;
        } else {
          failed++;
        }
      } catch (e) {
        failed++;
        console.error("send-push exception:", e);
      }
    }

    return new Response(
      JSON.stringify({ ok: true, scanned, queued, sent, skipped, failed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("daily-push error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e), scanned, queued, sent, failed }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
