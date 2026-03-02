import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
      partnerHasTime,
      language,
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const lang = language === "ka" ? "Georgian" : "English";
    const today = new Date().toISOString().split("T")[0];

    const timeAckInstruction = partnerHasTime
      ? `IMPORTANT: The partner's exact birth time was provided, so Moon and Rising signs are calculated with higher precision. Begin your analysis by acknowledging this: mention that because the exact birth time was provided, ${partnerName || "the partner"}'s Moon and Rising sign analysis is more precise.`
      : `Note: The partner's birth time was not provided, so Moon and Rising signs are approximate estimates.`;

    const prompt = `You are an expert relationship synastry astrologer. Generate a deep compatibility analysis for this couple.

CRITICAL CONTEXT:
- Today's date is ${today}. The current year is ${new Date().getFullYear()}.
- Any references to time or dates must be accurate to this context.

${timeAckInstruction}

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

Analyze the synastry between these two charts. You MUST respond with ONLY a valid JSON object (no markdown, no code fences) with this exact structure:

{
  "time_acknowledged": ${partnerHasTime ? "true" : "false"},
  "overall_score": 85,
  "emotional": {
    "score": 80,
    "analysis": "2-3 sentences about emotional connection based on Moon sign interplay..."
  },
  "romantic": {
    "score": 90,
    "analysis": "2-3 sentences about physical/romantic chemistry based on Mars & Venus energy..."
  },
  "communication": {
    "score": 75,
    "analysis": "2-3 sentences about communication style based on Mercury dynamics..."
  },
  "goals": {
    "score": 85,
    "analysis": "2-3 sentences about shared goals & finances based on Jupiter & Saturn..."
  }
}

Rules:
- "overall_score" must be 0-100, representing the overall synastry compatibility
- Each category score must be 0-100
- Each "analysis" must be 2-3 sentences, specific to these two people's chart dynamics
- Reference actual astrological aspects: Moon conjunct Moon, Venus trine Mars, etc.
- Be mystical yet practical — mention how the energy manifests in real-life behavior
- "time_acknowledged" must be ${partnerHasTime ? "true" : "false"}
- ALL text content (analysis fields) MUST be written in ${lang}
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
          { role: "system", content: `You are an expert synastry astrologer. Today is ${today}. Return ONLY valid JSON, no markdown formatting.` },
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
    console.error("synastry-report error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
