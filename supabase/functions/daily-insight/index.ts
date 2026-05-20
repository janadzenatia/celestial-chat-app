import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildSystemPrompt } from "../_shared/persona.ts";
import { validateAuth } from "../_shared/auth.ts";
import { callGeminiWithRetry, stripMarkdown, extractTokenUsage, logTokenUsage } from "../_shared/gemini.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function fallbackInsight(language: string, name?: string, period?: string) {
  const isGeorgian = language === "ka";
  if (isGeorgian) {
    return `${name || "შენ"}, დღეს შენი ენერგია რბილად გთხოვს, საკუთარ ინტუიციას ენდო. ${period === "morning" ? "დღე დაიწყე ერთი მშვიდი გადაწყვეტილებით." : "საღამოს დატოვე ადგილი სიმშვიდისთვის და შინაგანი პასუხებისთვის."}`;
  }

  return `${name || "Star Seeker"}, today your energy gently asks you to trust your intuition. ${period === "morning" ? "Begin with one calm decision." : "Leave room tonight for quiet and inner answers."}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = await validateAuth(req);
    if (auth.error) return auth.error;

    const { name, sunSign, moonSign, risingSign, language, period } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("Missing API key");

    const lang = language === "ka" ? "Georgian" : "English";
    const tone = period === "morning" ? "motivating, energizing" : "reflective, calming";

    const prompt = `Personalized phrase for ${name || "Star Seeker"}. Sun=${sunSign}, Moon=${moonSign}, Rising=${risingSign}. Tone: ${tone}. 2-3 sentences, address by name, reference their signs, one actionable advice. No greeting. Use zodiac emojis. ${lang} only.`;

    const systemPrompt = buildSystemPrompt(
      "Concise daily astrological phrases. Warm, empowering.",
      language
    );

    const response = await callGeminiWithRetry({
      apiKey: GEMINI_API_KEY,
      body: {
        model: "gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
      },
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ content: fallbackInsight(language, name, period), fallback: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const tokenData = extractTokenUsage(data);
    logTokenUsage(auth.userId, "daily-insight", tokenData);

    const content = stripMarkdown(data.choices?.[0]?.message?.content || "The stars are quiet today...");

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("daily-insight error:", e);
    return new Response(JSON.stringify({ content: fallbackInsight("en"), fallback: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
