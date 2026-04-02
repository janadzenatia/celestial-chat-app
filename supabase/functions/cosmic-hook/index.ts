import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildSystemPrompt } from "../_shared/persona.ts";
import { validateAuth } from "../_shared/auth.ts";
import { callGeminiWithRetry, stripMarkdown, extractTokenUsage, logTokenUsage } from "../_shared/gemini.ts";

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

    const { userName, sunSign, moonSign, risingSign, language, todaySubject } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("Missing API key");

    const lang = language === "ka" ? "Georgian" : "English";
    const cta = language === "ka" ? "შეეხე და გაიგე მეტი." : "Tap to discover more.";

    const isSelf = todaySubject?.relationship === "self";
    const focus = isSelf
      ? `About ${userName} themselves (subject="self").`
      : `About "${todaySubject?.name}" (${todaySubject?.relationship}, born ${todaySubject?.dateOfBirth}). Set subject="${todaySubject?.name}".`;

    const langRule = language === "ka"
      ? `Georgian only. Informal "შენობითი" form.`
      : `English only.`;

    const prompt = `Generate 1-sentence cosmic push notification. User: ${userName}, Sun=${sunSign}, Moon=${moonSign}, Rising=${risingSign}. ${focus} Create curiosity, positive urgency, no solutions. End with "${cta}". No negativity. ${langRule} Return JSON: {"hook":"text","subject":"name or self","subjectDob":"dob or null"}`;

    const systemPrompt = buildSystemPrompt("Elite AI astrologer generating push notifications. Return ONLY valid JSON.", language);

    const response = await callGeminiWithRetry({
      apiKey: GEMINI_API_KEY,
      body: {
        model: "gemini-2.0-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "cosmic_hook",
              description: "Return the push notification hook",
              parameters: {
                type: "object",
                properties: {
                  hook: { type: "string" },
                  subject: { type: "string" },
                  subjectDob: { type: "string" },
                },
                required: ["hook", "subject"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "cosmic_hook" } },
      },
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const result = await response.json();
    const tokenData = extractTokenUsage(result);
    logTokenUsage(auth.userId, "cosmic-hook", tokenData);

    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    let hookData = { hook: "", subject: "self", subjectDob: null };

    if (toolCall?.function?.arguments) {
      try {
        hookData = JSON.parse(toolCall.function.arguments);
        if (hookData.hook) hookData.hook = stripMarkdown(hookData.hook);
      } catch {
        hookData.hook = stripMarkdown(toolCall.function.arguments);
      }
    }

    return new Response(JSON.stringify(hookData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("cosmic-hook error:", e);
    return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
