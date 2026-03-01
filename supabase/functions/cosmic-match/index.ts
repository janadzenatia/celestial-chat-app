import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { name, dateOfBirth, sunSign, moonSign, risingSign, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const lang = language === "ka" ? "Georgian" : "English";
    const userName = name || "Star Seeker";

    const prompt = `You are a deep psychological astrologer generating a highly personalized "Ideal Cosmic Match" profile.

User Profile:
- Name: ${userName}
- Date of Birth: ${dateOfBirth}
- Sun Sign: ${sunSign || "Unknown"}
- Moon Sign: ${moonSign || "Unknown"}
- Rising Sign: ${risingSign || "Unknown"}

Generate a personalized ideal romantic partner profile. You MUST respond with ONLY a valid JSON object (no markdown, no code fences) with this exact structure:

{
  "compatible_signs": ["Sign1", "Sign2", "Sign3"],
  "birth_years": [1991, 1993, 1997],
  "personality_profile": "A detailed paragraph..."
}

Rules for content:
- "compatible_signs": Pick 2-3 zodiac signs that are the absolute best match for this user's specific chart combination (Sun + Moon + Rising synergy). Use English sign names (Aries, Taurus, etc.).
- "birth_years": Suggest exactly 3 specific birth years that would create powerful astrological harmony. Consider element cycles, Jupiter returns, and Saturn placements relative to the user's birth year. The years should be realistic (within ±10 years of the user's birth year).
- "personality_profile": Write 3-4 sentences describing the ideal partner's character, emotional nature, how they complement the user's chart, and how they will treat ${userName}. Be specific, mystical yet practical. Reference actual astrological dynamics.

ALL text content (personality_profile) MUST be written in ${lang}.
Sign names in compatible_signs MUST always be in English.
Respond with ONLY the JSON object, nothing else.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a deep psychological astrologer. Return ONLY valid JSON, no markdown formatting." },
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
    let content = data.choices?.[0]?.message?.content || "";

    // Strip markdown code fences if present
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    try {
      const parsed = JSON.parse(content);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch {
      console.error("Failed to parse AI response as JSON:", content);
      return new Response(JSON.stringify({ error: "Invalid AI response format" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    console.error("cosmic-match error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
