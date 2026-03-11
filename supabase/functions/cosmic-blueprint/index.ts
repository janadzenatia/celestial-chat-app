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
    const { name, dob, tob, pob, language } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("Missing API key");

    const lang = language === "ka" ? "Georgian" : "English";

    const prompt = `Generate a deep personal astrological blueprint for this person.

Person:
- Name: ${name || "User"}
- Date of Birth: ${dob}
${tob ? `- Time of Birth: ${tob}` : "- Time of Birth: unknown"}
${pob ? `- Place of Birth: ${pob}` : ""}

You MUST respond with ONLY a valid JSON object (no markdown, no code fences) with this exact structure:

{
  "core_personality": {
    "title": "${language === "ka" ? "ბირთვული პიროვნება" : "Core Personality"}",
    "content": "3-4 sentences about their core personality traits based on Sun, Moon, and Rising sign interplay. Be specific and personal."
  },
  "karmic_path": {
    "title": "${language === "ka" ? "კარმული გზა" : "Karmic Path"}",
    "content": "3-4 sentences about their karmic lessons, North Node direction, and life purpose. Include specific astrological references."
  },
  "hidden_strengths": {
    "title": "${language === "ka" ? "ფარული ძლიერი მხარეები" : "Hidden Strengths"}",
    "content": "3-4 sentences about untapped potential, hidden talents, and strengths they may not recognize. Reference specific placements."
  }
}

Rules:
- Each "content" must be 3-4 sentences, deeply personal and specific
- Reference actual astrological aspects and placements
- Lead with empowering insights
- Be mystical yet practical
- ALL text content MUST be written in ${lang}
- Respond with ONLY the JSON object, nothing else.`;

    const systemPrompt = buildSystemPrompt(
      `You are an expert natal chart astrologer creating a deep personal cosmic blueprint. Return ONLY valid JSON, no markdown formatting.`,
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
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
    console.error("cosmic-blueprint error:", e);
    return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
