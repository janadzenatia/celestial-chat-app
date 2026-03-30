import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildSystemPrompt } from "../_shared/persona.ts";
import { validateAuth, requirePremium } from "../_shared/auth.ts";

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

    const { name, dateOfBirth, sunSign, moonSign, risingSign, language } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("Missing API key");

    const lang = language === "ka" ? "Georgian" : "English";
    const userName = name || "Star Seeker";

    const prompt = `Generate a highly personalized "Ideal Cosmic Match" profile.

User Profile:
- Name: ${userName}
- Date of Birth: ${dateOfBirth}
- Sun Sign: ${sunSign || "Unknown"}
- Moon Sign: ${moonSign || "Unknown"}
- Rising Sign: ${risingSign || "Unknown"}

Generate a personalized ideal romantic partner profile. Respond with ONLY a valid JSON object (no markdown, no code fences):

{
  "compatible_signs": ["Sign1", "Sign2", "Sign3"],
  "birth_years": [1991, 1993, 1997],
  "personality_profile": "A detailed paragraph..."
}

Rules:
- "compatible_signs": 2-3 zodiac signs that are the best match for this user's chart combination. Use English sign names.
- "birth_years": 3 specific birth years that create powerful astrological harmony. Within ±10 years of the user's birth year.
- "personality_profile": 3-4 sentences describing the ideal partner's character. Lead with how this partner complements ${userName}'s strengths. Be empowering and optimistic.
- ALL text content (personality_profile) MUST be written in ${lang}.
- Sign names in compatible_signs MUST always be in English.
- Respond with ONLY the JSON object.`;

    const systemPrompt = buildSystemPrompt(
      "You are a deep psychological astrologer specializing in romantic compatibility. Return ONLY valid JSON, no markdown formatting.",
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
    let content = data.choices?.[0]?.message?.content || "";
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    try {
      const parsed = JSON.parse(content);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch {
      console.error("Failed to parse AI response");
      return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    console.error("cosmic-match error:", e);
    return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
