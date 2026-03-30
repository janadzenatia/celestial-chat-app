import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildSystemPrompt, FAMILY_PERSONA_EXTRA } from "../_shared/persona.ts";
import { validateAuth } from "../_shared/auth.ts";

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

    const { zodiacSign, language } = await req.json();

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("Missing API key");

    const lang = language === "ka" ? "Georgian" : "English";

    const prompt = `A parent is expecting a baby who will be a ${zodiacSign}.

Write a short, exciting 3-4 sentence personality summary of what to expect from a ${zodiacSign} baby. Be warm, specific, and deeply encouraging. Focus on the child's natural gifts, strengths, and potential. Mention key personality traits, emotional tendencies, and what kind of beautiful parent-child bond to expect.

Return ONLY valid JSON (no markdown):

{
  "summary": "Your 3-4 sentence personality summary here..."
}

Rules:
- ALL text MUST be in ${lang}
- Lead with the child's strengths and natural gifts
- Be enthusiastic, nurturing, and reassuring
- Return ONLY JSON.`;

    const systemPrompt = buildSystemPrompt(
      "You are a warm, encouraging astrologer specializing in baby personalities. Return ONLY valid JSON.",
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
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    const parsed = JSON.parse(content);
    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("baby-personality error:", e);
    return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
