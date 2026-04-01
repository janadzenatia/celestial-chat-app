import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildSystemPrompt, FAMILY_PERSONA_EXTRA } from "../_shared/persona.ts";
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

    const { parentName, parentDob, parentSunSign, parentMoonSign, parentRisingSign, childName, childDob, childTimeOfBirth, childBirthPlace, childSunSign, childMoonSign, childRisingSign, childHasTime, childHasPlace, language } = await req.json();

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("Missing API key");

    const lang = language === "ka" ? "Georgian" : "English";
    const today = new Date().toISOString().split("T")[0];

    const prompt = `Analyze the parent-child astrological dynamic.

CRITICAL: Today's date is ${today}. Current year is ${new Date().getFullYear()}.

Parent:
- Name: ${parentName || "Parent"}
- Date of Birth: ${parentDob}
- Sun: ${parentSunSign || "Unknown"}, Moon: ${parentMoonSign || "Unknown"}, Rising: ${parentRisingSign || "Unknown"}

Child:
- Name: ${childName}
- Date of Birth: ${childDob}
${childTimeOfBirth ? `- Birth Time: ${childTimeOfBirth}` : ""}
${childBirthPlace ? `- Birth Place: ${childBirthPlace}` : ""}
- Sun: ${childSunSign || "Unknown"}, Moon: ${childMoonSign || "Unknown"}, Rising: ${childRisingSign || "Unknown"}
${childHasTime && childHasPlace ? "- Birth time and place provided: Big 3 (Sun, Moon, Rising) are precise." : childHasTime ? "- Birth time provided but no place: Moon is precise, Rising is approximate." : "- No birth time: Moon/Rising are approximate."}

Return ONLY a valid JSON object (no markdown) with this structure:

{
  "blueprint": "3-4 sentences describing ${childName}'s cosmic personality blueprint — lead with their natural gifts and strengths. Mention Sun, Moon, Rising qualities, element balance, and key talents.",
  "emotional_connection": "3-4 sentences analyzing the emotional dynamic between ${parentName || "the parent"} and ${childName} — highlight the beautiful aspects of their bond first, then areas where extra understanding helps them grow closer.",
  "parenting_advice": "3-4 sentences with specific parenting advice — how to nurture ${childName}'s unique cosmic nature, communication tips, and how to turn any friction points into opportunities for deeper connection."
}

Rules:
- ALL text MUST be in ${lang}
- Be extremely warm, nurturing, and encouraging
- Focus on the child's potential, gifts, and the beauty of the parent-child bond
- Frame any challenges as growth opportunities with constructive advice
- Reference real astrological aspects using **bold** for key terms
- Return ONLY the JSON, nothing else.`;

    const systemPrompt = buildSystemPrompt(
      `You are a warm, expert family astrologer. Today is ${today}. Return ONLY valid JSON.`,
      language,
      FAMILY_PERSONA_EXTRA
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
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    content = content
      .replace(/,\s*([}\]])/g, "$1")
      .replace(/[\x00-\x1F\x7F]/g, " ");

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (!match) {
        console.error("Could not extract JSON from AI response");
        return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const cleaned = match[0].replace(/,\s*([}\]])/g, "$1");
      parsed = JSON.parse(cleaned);
    }

    return new Response(JSON.stringify(stripMarkdownDeep(parsed)), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("child-synastry error:", e);
    return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});