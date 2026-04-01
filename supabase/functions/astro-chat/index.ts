import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildSystemPrompt } from "../_shared/persona.ts";
import { validateAuth } from "../_shared/auth.ts";
import { callGeminiWithRetry } from "../_shared/gemini.ts";

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
      birthContext = `\nUser: ${birthData.name || "?"}, DOB=${birthData.dateOfBirth || "?"}, TOB=${birthData.timeOfBirth || "?"}, POB=${birthData.placeOfBirth || "?"}. Big 3: Sun=${birthData.sunSign}, Moon=${birthData.moonSign}, Rising=${birthData.risingSign}. Use these exact signs.`;
    }

    const modMsg = language === "ka"
      ? `If inappropriate: respond ONLY "ეს შეტყობინება ვერ დამუშავდა — გთხოვ დაიცვა კომუნიკაციის ეთიკური ნორმები. ✨"`
      : `If inappropriate: respond ONLY "This message could not be processed — please keep your communication respectful. ✨"`;

    const systemPrompt = buildSystemPrompt(
      `Astrochat — witty, empathetic AI astrologer. 4 sentences max unless asked for detail. Use zodiac emojis. Strengths before challenges. Every challenge needs constructive advice.${birthContext}\n${modMsg}`,
      language
    );

    const response = await callGeminiWithRetry({
      apiKey: GEMINI_API_KEY,
      body: {
        model: "gemini-2.0-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      },
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
