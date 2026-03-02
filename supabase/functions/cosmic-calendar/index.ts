import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { dateOfBirth, timeOfBirth, sunSign, moonSign, risingSign, month, year, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const lang = language === "ka" ? "Georgian" : "English";
    const daysInMonth = new Date(year, month, 0).getDate();

    const systemPrompt = `You are an elite transit astrologer. You analyze planetary transits for a specific person and generate a monthly cosmic calendar.

The person's birth data:
- Date of Birth: ${dateOfBirth}
- Time of Birth: ${timeOfBirth || "Not provided"}
- Sun Sign: ${sunSign || "Unknown"}
- Moon Sign: ${moonSign || "Unknown"}
- Rising Sign: ${risingSign || "Unknown"}

TASK: Generate a cosmic traffic light calendar for ${year}-${String(month).padStart(2, "0")} (${daysInMonth} days).

For EACH day of the month, provide:
1. "color": "green" (favorable), "red" (challenging), or "neutral"
2. "advice": A single sentence explaining why. Reference specific planetary aspects (Moon conjunct Venus, Mars square Saturn, etc.)

Rules:
- Be realistic: ~8-10 green days, ~5-7 red days, rest neutral
- Respond in ${lang} ONLY for the advice text
- Colors must be English strings: "green", "red", "neutral"`;

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
      return new Response(JSON.stringify({ error: "AI service error" }), {
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
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
