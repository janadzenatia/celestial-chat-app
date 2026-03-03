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
    const {
      userName, userDob, userSunSign, userMoonSign, userRisingSign,
      partnerName, partnerDob, partnerSunSign, partnerMoonSign, partnerRisingSign,
      relationshipDate, language,
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const lang = language === "ka" ? "Georgian" : "English";
    const today = new Date().toISOString().split("T")[0];

    const prompt = `Generate a deep, personalized 12-month relationship forecast.

CRITICAL CONTEXT:
- Today's date is ${today}. All forecasts must be for FUTURE dates only.
- The current year is ${new Date().getFullYear()}.

Person 1:
- Name: ${userName || "Person 1"}
- Date of Birth: ${userDob}
- Sun Sign: ${userSunSign || "Unknown"}
- Moon Sign: ${userMoonSign || "Unknown"}
- Rising Sign: ${userRisingSign || "Unknown"}

Person 2:
- Name: ${partnerName || "Person 2"}
- Date of Birth: ${partnerDob}
- Sun Sign: ${partnerSunSign || "Unknown"}
- Moon Sign: ${partnerMoonSign || "Unknown"}
- Rising Sign: ${partnerRisingSign || "Unknown"}

Relationship Start / Marriage Date: ${relationshipDate}

You MUST respond with ONLY a valid JSON object (no markdown, no code fences):

{
  "intro": "A personalized 3-4 sentence introductory paragraph. Calculate how long they've been together. Address them by name. Preview the upcoming cosmic energy themes.",
  "periods": [
    {
      "month": "Month Year",
      "title": "Short evocative title",
      "type": "positive" | "challenge" | "neutral",
      "description": "3-4 sentences of deeply specific, actionable advice referencing actual planetary transits"
    }
  ]
}

Rules:
- "intro" MUST calculate the real duration from ${relationshipDate} to ${today}. Address both by name.
- Generate exactly 6-7 forecast periods, covering bi-monthly intervals across the next 12 months starting from ${today}
- "month" format: "March-April 2026" for bi-monthly periods
- "type": "positive", "challenge", or "neutral" — vary realistically
- For "challenge" periods: always emphasize that this is a growth opportunity and provide specific constructive advice
- "title" should be evocative and specific (e.g., "**Venus Conjunct Mars**: Reignited Passion")
- "description": 3-4 sentences with specific transit references and actionable advice
- Strengths and opportunities first, then growth areas with guidance
- ALL text content MUST be written in ${lang}
- Month names MUST be in ${lang}
- Respond with ONLY the JSON object.`;

    const systemPrompt = buildSystemPrompt(
      `You are an elite relationship transit astrologer. Today is ${today}. All forecasts must reference future dates only. Return ONLY valid JSON, no markdown formatting.`,
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
    let content = data.choices?.[0]?.message?.content || "";
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    try {
      const parsed = JSON.parse(content);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Invalid AI response format" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    console.error("relationship-forecast error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
