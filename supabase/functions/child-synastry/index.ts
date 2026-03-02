import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { parentName, parentDob, parentSunSign, parentMoonSign, parentRisingSign, childName, childDob, childSunSign, childMoonSign, childRisingSign, childHasTime, language } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const lang = language === "ka" ? "Georgian" : "English";
    const today = new Date().toISOString().split("T")[0];

    const prompt = `You are a warm, empathetic expert family astrologer. Analyze the parent-child astrological dynamic.

CRITICAL: Today's date is ${today}. Current year is ${new Date().getFullYear()}.

Parent:
- Name: ${parentName || "Parent"}
- Date of Birth: ${parentDob}
- Sun: ${parentSunSign || "Unknown"}, Moon: ${parentMoonSign || "Unknown"}, Rising: ${parentRisingSign || "Unknown"}

Child:
- Name: ${childName}
- Date of Birth: ${childDob}
- Sun: ${childSunSign || "Unknown"}, Moon: ${childMoonSign || "Unknown"}, Rising: ${childRisingSign || "Unknown"}
${childHasTime ? "- Birth time provided: Moon and Rising are precise." : "- No birth time: Moon/Rising are approximate."}

Return ONLY a valid JSON object (no markdown) with this structure:

{
  "blueprint": "3-4 sentences describing ${childName}'s cosmic personality blueprint — Sun, Moon, Rising qualities, element balance, key strengths and natural tendencies.",
  "emotional_connection": "3-4 sentences analyzing the emotional dynamic between ${parentName || "the parent"} and ${childName} — Moon sign interplay, attachment styles, how they nurture each other.",
  "parenting_advice": "3-4 sentences with specific parenting advice — friction points to watch, communication tips, how to support ${childName}'s unique cosmic nature."
}

Rules:
- ALL text MUST be in ${lang}
- Be warm, encouraging, specific to these charts
- Reference real astrological aspects
- Return ONLY the JSON, nothing else.`;

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
    console.error("child-synastry error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
