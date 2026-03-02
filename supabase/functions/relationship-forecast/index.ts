import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { userDob, userSunSign, userMoonSign, userRisingSign, partnerDob, partnerSunSign, relationshipDate, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const lang = language === "ka" ? "Georgian" : "English";

    const prompt = `You are an expert relationship transit astrologer. Analyze the upcoming 12 months of astrological transits for this couple.

User:
- Date of Birth: ${userDob}
- Sun Sign: ${userSunSign || "Unknown"}
- Moon Sign: ${userMoonSign || "Unknown"}
- Rising Sign: ${userRisingSign || "Unknown"}

Partner:
- Date of Birth: ${partnerDob}
- Sun Sign: ${partnerSunSign || "Unknown"}

Relationship Start / Marriage Date: ${relationshipDate}

Based on the composite chart and upcoming planetary transits from today onward for the next 12 months, generate a relationship forecast.

You MUST respond with ONLY a valid JSON object (no markdown, no code fences) with this exact structure:

{
  "periods": [
    {
      "month": "Month Year",
      "title": "Short evocative title",
      "type": "positive" | "challenge" | "neutral",
      "description": "2-3 sentences of actionable advice"
    }
  ]
}

Rules:
- Generate exactly 3 forecast periods spread across the next 12 months
- "month" should be like "October 2026" format
- "type" must be one of: "positive", "challenge", "neutral"
- "title" should be evocative and specific (e.g., "Deep Emotional Bonding", "Communication Challenge")
- "description" should include specific actionable advice for the couple
- Reference actual planetary transits and astrological dynamics
- ALL text content MUST be written in ${lang}
- Month names should also be in ${lang}
- Respond with ONLY the JSON object, nothing else.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert relationship transit astrologer. Return ONLY valid JSON, no markdown formatting." },
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
