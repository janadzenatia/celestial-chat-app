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

    const { messages, birthData, language } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("Missing API key");

    let birthContext = "";
    if (birthData) {
      birthContext = `

You are a professional astrologer. The user's birth data:
- Name: ${birthData.name || "Unknown"}
- Date of Birth: ${birthData.dateOfBirth || "Unknown"}
- Time of Birth: ${birthData.timeOfBirth || "Not provided"}
- Place of Birth: ${birthData.placeOfBirth || "Unknown"}

Their Big 3 (calculated from exact birth data):
- Sun Sign: ${birthData.sunSign || "Unknown"}
- Moon Sign: ${birthData.moonSign || "Unknown"}
- Ascendant (Rising): ${birthData.risingSign || "Unknown"}

Answer all questions based on their exact real horoscope using these precise Big 3 values. Reference their specific signs and planetary placements when relevant.`;
    }

    const moderationInstruction = language === "ka"
      ? `\n\nCONTENT MODERATION: If the user's message is inappropriate, offensive, sexually explicit, hateful, or unethical, you MUST respond with EXACTLY this text and nothing else: "ეს შეტყობინება ვერ დამუშავდა — გთხოვ დაიცვა კომუნიკაციის ეთიკური ნორმები. ✨"\nDo NOT engage with or elaborate on inappropriate content. Just return the exact moderation message above.`
      : `\n\nCONTENT MODERATION: If the user's message is inappropriate, offensive, sexually explicit, hateful, or unethical, you MUST respond with EXACTLY this text and nothing else: "This message could not be processed — please keep your communication respectful. ✨"\nDo NOT engage with or elaborate on inappropriate content. Just return the exact moderation message above.`;

    const systemPrompt = buildSystemPrompt(
      `You are Astrochat — a witty, empathetic, and mystical AI astrologer. You speak with warmth and cosmic wisdom, blending modern conversational tone with mystical flair.

Rules:
- Keep responses to 4 sentences maximum unless the user asks for detail.
- Use zodiac emojis and celestial references naturally.
- Always highlight strengths before challenges.
- Every challenge must come with constructive advice.${birthContext}${moderationInstruction}`,
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
          ...messages,
        ],
        stream: true,
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

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
