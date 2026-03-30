import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildSystemPrompt } from "../_shared/persona.ts";
import { validateAuth } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = await validateAuth(req);
    if (auth.error) return auth.error;

    const { name, sunSign, moonSign, risingSign, language, period } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("Missing API key");

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

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.0-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), {
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
    return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
