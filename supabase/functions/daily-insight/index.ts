import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildSystemPrompt } from "../_shared/persona.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { name, sunSign, moonSign, risingSign, language, period } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const lang = language === "ka" ? "Georgian" : "English";
    const userName = name || "Star Seeker";
    const isMorning = period === "morning";

    const toneInstruction = isMorning
      ? "This is a MORNING/DAY phrase (00:00–14:00). Be motivating, energizing, and forward-looking. Inspire action and confidence for the day ahead."
      : "This is an EVENING/NIGHT phrase (14:00–23:59). Be reflective, calming, and introspective. Help them process the day and find peace.";

    const prompt = `Generate a personalized "Phrase of the Day" for ${userName}.

Their Big 3:
- Sun Sign: ${sunSign || "Unknown"}
- Moon Sign: ${moonSign || "Unknown"}
- Rising Sign: ${risingSign || "Unknown"}

${toneInstruction}

Rules:
- Address them by name directly.
- Reference their specific signs and how planetary energies affect them TODAY.
- Be mystical yet practical — give one actionable piece of advice.
- Keep it to 2-3 sentences maximum.
- Highlight their strengths first, then offer guidance.
- Do NOT include any greeting like "Hello" or "Hi" — start directly with the insight.
- Use zodiac emojis naturally.
- Respond ONLY in ${lang}.`;

    const systemPrompt = buildSystemPrompt(
      "You provide personalized daily astrological phrases. Keep responses warm, empowering, and concise.",
      language
    );

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "The stars are quiet today...";

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("daily-insight error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
