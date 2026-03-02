import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { userName, userSunSign, userMoonSign, userElement, partnerName, partnerSunSign, partnerMoonSign, partnerElement, language } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const lang = language === "ka" ? "Georgian" : "English";
    const today = new Date().toISOString().split("T")[0];

    const prompt = `You are an expert family planning astrologer. A couple wants to know which Zodiac signs would create the ideal child to bring cosmic balance to their relationship.

Parent 1: ${userName || "Parent 1"} — Sun: ${userSunSign}, Moon: ${userMoonSign}, Element: ${userElement}
Parent 2: ${partnerName || "Parent 2"} — Sun: ${partnerSunSign}, Moon: ${partnerMoonSign}, Element: ${partnerElement}

Analyze the elemental makeup of both parents. Suggest 1-2 ideal Zodiac signs for their future child that would bring ultimate balance to their specific relationship dynamic.

Return ONLY valid JSON (no markdown):

{
  "signs": [
    {
      "sign": "Taurus",
      "emoji": "♉",
      "element": "Earth",
      "reasoning": "2-3 sentences explaining why this sign would balance the parents' dynamic..."
    }
  ],
  "summary": "2-3 sentences with an overarching cosmic insight about what element/quality their family needs most."
}

Rules:
- Suggest 1-2 signs maximum
- Be warm, encouraging, specific to these parents
- Explain how the child's element/modality balances or complements the parents
- ALL text MUST be in ${lang}
- Return ONLY JSON.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: `You are a family astrologer. Today is ${today}. Return ONLY valid JSON.` },
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
