import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildSystemPrompt } from "../_shared/persona.ts";
import { validateAuth, requirePremium } from "../_shared/auth.ts";
import { callGeminiWithRetry, stripMarkdownDeep } from "../_shared/gemini.ts";

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

    const premiumCheck = await requirePremium(auth.userId);
    if (premiumCheck) return premiumCheck;

    const {
      userName, userDob, userTimeOfBirth, userPlaceOfBirth, userSunSign, userMoonSign, userRisingSign,
      partnerName, partnerDob, partnerTimeOfBirth, partnerPlaceOfBirth, partnerSunSign, partnerMoonSign, partnerRisingSign,
      relationshipDate, language,
    } = await req.json();

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("Missing API key");

    const lang = language === "ka" ? "Georgian" : "English";
    const today = new Date().toISOString().split("T")[0];

    const prompt = `Generate a deep, personalized 12-month relationship forecast.

CRITICAL CONTEXT:
- Today's date is ${today}. All forecasts must be for FUTURE dates only.
- The current year is ${new Date().getFullYear()}.

Person 1:
- Name: ${userName || "Person 1"}
- Date of Birth: ${userDob}
${userTimeOfBirth ? `- Time of Birth: ${userTimeOfBirth}` : ""}
${userPlaceOfBirth ? `- Place of Birth: ${userPlaceOfBirth}` : ""}
- Sun Sign: ${userSunSign || "Unknown"}
- Moon Sign: ${userMoonSign || "Unknown"}
- Ascendant (Rising): ${userRisingSign || "Unknown"}

Person 2:
- Name: ${partnerName || "Person 2"}
- Date of Birth: ${partnerDob}
${partnerTimeOfBirth ? `- Time of Birth: ${partnerTimeOfBirth}` : ""}
${partnerPlaceOfBirth ? `- Place of Birth: ${partnerPlaceOfBirth}` : ""}
- Sun Sign: ${partnerSunSign || "Unknown"}
- Moon Sign: ${partnerMoonSign || "Unknown"}
- Ascendant (Rising): ${partnerRisingSign || "Unknown"}

Relationship Start / Marriage Date: ${relationshipDate}

Generate relationship forecast considering both people's exact Big 3 signs and their synastry.

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
      `You are an elite relationship transit astrologer. Today is ${today}. Person 1: Sun=${userSunSign}, Moon=${userMoonSign}, ASC=${userRisingSign}. Person 2: Sun=${partnerSunSign}, Moon=${partnerMoonSign}, ASC=${partnerRisingSign}. All forecasts must reference future dates only. Return ONLY valid JSON, no markdown formatting.`,
      language
    );

    const response = await callGeminiWithRetry({
      apiKey: GEMINI_API_KEY,
      body: {
        model: "gemini-2.0-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
      },
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
      return new Response(JSON.stringify(stripMarkdownDeep(parsed)), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch {
      console.error("Failed to parse AI response");
      return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    console.error("relationship-forecast error:", e);
    return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});