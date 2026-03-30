import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildSystemPrompt } from "../_shared/persona.ts";
import { validateAuth, requirePremium } from "../_shared/auth.ts";

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

    const { dateOfBirth, timeOfBirth, sunSign, moonSign, risingSign, month, year, language } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("Missing API key");

    const lang = language === "ka" ? "Georgian" : "English";
    const daysInMonth = new Date(year, month, 0).getDate();

    const basePrompt = `You are an elite transit astrologer. You analyze planetary transits for a specific person and generate a monthly cosmic calendar.

The person's birth data:
- Date of Birth: ${dateOfBirth}
- Time of Birth: ${timeOfBirth || "Not provided"}
- Sun Sign: ${sunSign || "Unknown"}
- Moon Sign: ${moonSign || "Unknown"}
- Rising Sign: ${risingSign || "Unknown"}

TASK: Generate a cosmic traffic light calendar for ${year}-${String(month).padStart(2, "0")} (${daysInMonth} days).

For EACH day of the month, provide:
1. "color": "green" (favorable), "red" (challenging but a growth opportunity), or "neutral"
2. "advice": A single sentence explaining why. Reference specific planetary aspects. For "red" days, always include constructive advice on how to navigate the energy.

Rules:
- Be realistic: ~8-10 green days, ~5-7 red days, rest neutral
- "Red" days are NOT bad days — frame them as opportunities for growth and awareness
- Respond in ${lang} ONLY for the advice text
- Colors must be English strings: "green", "red", "neutral"`;

    const systemPrompt = buildSystemPrompt(basePrompt, language);

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.0-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate the cosmic calendar for all ${daysInMonth} days.` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "cosmic_calendar",
              description: "Return the monthly cosmic calendar data",
              parameters: {
                type: "object",
                properties: {
                  days: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        day: { type: "number" },
                        color: { type: "string", enum: ["green", "red", "neutral"] },
                        advice: { type: "string" },
                      },
                      required: ["day", "color", "advice"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["days"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "cosmic_calendar" } },
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
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    let calendarData = { days: [] };

    if (toolCall?.function?.arguments) {
      try {
        calendarData = JSON.parse(toolCall.function.arguments);
      } catch {
        console.error("Failed to parse calendar data");
      }
    }

    return new Response(JSON.stringify(calendarData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("cosmic-calendar error:", e);
    return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
