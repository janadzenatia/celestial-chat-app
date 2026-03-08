import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildSystemPrompt, FAMILY_PERSONA_EXTRA } from "../_shared/persona.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { userName, userSunSign, userMoonSign, userElement, partnerName, partnerSunSign, partnerMoonSign, partnerElement, children, language } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const lang = language === "ka" ? "Georgian" : "English";
    const today = new Date().toISOString().split("T")[0];

    // Build children section if they exist
    let childrenSection = "";
    const childrenArray = Array.isArray(children) ? children : [];
    if (childrenArray.length > 0) {
      childrenSection = "\nExisting Children in the family:\n" +
        childrenArray.map((c: any, i: number) =>
          `Child ${i + 1}: ${c.name} — Sun: ${c.sunSign}, Moon: ${c.moonSign}, Element: ${c.element}`
        ).join("\n") +
        "\n\nIMPORTANT: You MUST analyze the COMPLETE family dynamic — both parents AND all existing children listed above. The recommendation must balance the entire family system, not just the couple. Consider what elemental energy or modality is underrepresented across ALL family members.\n";
    }

    const prompt = `A couple wants to know which Zodiac signs would create the ideal child to bring cosmic balance to their ${childrenArray.length > 0 ? "family" : "relationship"}.

Parent 1: ${userName || "Parent 1"} — Sun: ${userSunSign}, Moon: ${userMoonSign}, Element: ${userElement}
Parent 2: ${partnerName || "Parent 2"} — Sun: ${partnerSunSign}, Moon: ${partnerMoonSign}, Element: ${partnerElement}
${childrenSection}
Analyze the elemental makeup of ${childrenArray.length > 0 ? "the entire family (both parents and all children)" : "both parents"}. Suggest 1-2 ideal Zodiac signs for their ${childrenArray.length > 0 ? "next" : "future"} child that would bring balance and harmony.

Return ONLY valid JSON (no markdown):

{
  "signs": [
    {
      "sign": "Taurus",
      "emoji": "♉",
      "element": "Earth",
      "reasoning": "2-3 sentences explaining why this sign would beautifully balance the ${childrenArray.length > 0 ? "family's" : "parents'"} dynamic. Focus on the child's gifts and potential..."
    }
  ],
  "summary": "2-3 sentences with an overarching cosmic insight about what element/quality their family needs most. Be warm and encouraging.${childrenArray.length > 0 ? " Mention how the existing children's energies were considered in the analysis." : ""}"
}

Rules:
- Suggest 1-2 signs maximum
- Be extremely warm, nurturing, and encouraging — this is about a future child
- Focus on the child's potential and how they will enrich the family
- Explain how the child's element/modality complements ${childrenArray.length > 0 ? "the entire family dynamic" : "the parents"}
- ALL text MUST be in ${lang}
- Return ONLY JSON.`;

    const systemPrompt = buildSystemPrompt(
      `You are an expert family planning astrologer. Today is ${today}. Return ONLY valid JSON.`,
      language,
      FAMILY_PERSONA_EXTRA
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
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    const parsed = JSON.parse(content);
    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("missing-piece error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
