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
    const auth = await validateAuth(req);
    if (auth.error) return auth.error;

    const { partnerName, partnerSign, partnerElement, partnerMoonSign, partnerRisingSign, userSunSign, userMoonSign, userRisingSign, language } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("Missing API key");

    const basePrompt = `You are generating a SHORT 2-sentence love language & relationship style summary for someone based on their zodiac signs.

The person's name is "${partnerName || "Partner"}".
Their Sun sign is ${partnerSign} (${partnerElement} element).
${partnerMoonSign ? `Their Moon sign is ${partnerMoonSign}.` : ""}
${partnerRisingSign ? `Their Ascendant is ${partnerRisingSign}.` : ""}

${userSunSign ? `The user asking has: Sun=${userSunSign}, Moon=${userMoonSign || "Unknown"}, ASC=${userRisingSign || "Unknown"}.` : ""}

RULES:
1. Write EXACTLY 2 sentences. No more.
2. First sentence: their primary love language / how they express love based on their Moon sign and Sun sign.
3. Second sentence: their relationship style / what they need from a partner.
4. Be warm, insightful, and specific to their signs.
5. Do NOT use generic platitudes. Reference actual astrological traits.`;

    const systemPrompt = buildSystemPrompt(basePrompt, language);

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-1.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate a 2-sentence love language summary for ${partnerName} (Sun=${partnerSign}${partnerMoonSign ? `, Moon=${partnerMoonSign}` : ""}${partnerRisingSign ? `, ASC=${partnerRisingSign}` : ""}).` },
        ],
      }),
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

    const result = await response.json();
    const summary = result.choices?.[0]?.message?.content?.trim() || "";

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("partner-love-language error:", e);
    return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
