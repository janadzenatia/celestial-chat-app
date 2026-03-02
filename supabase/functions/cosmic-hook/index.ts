import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { userName, dateOfBirth, timeOfBirth, familyMembers, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const lang = language === "ka" ? "Georgian" : "English";
    const today = new Date().toISOString().split("T")[0];

    let familyContext = "";
    if (familyMembers && familyMembers.length > 0) {
      familyContext = `\n\nThe user has these saved family members:\n${familyMembers.map((m: any) => `- ${m.name} (born ${m.dateOfBirth}, relationship: ${m.relationship})`).join("\n")}`;
    }

    const systemPrompt = `You are an elite AI astrologer generating a push notification hook. Today is ${today}.

The user's name is "${userName || "Unknown"}". Their birth date is ${dateOfBirth || "Unknown"}, birth time is ${timeOfBirth || "Not provided"}.${familyContext}

TASK: Generate a single highly emotional, intriguing 1-sentence push notification. Rules:
1. If there are family members, pick ONE specific family member by name and reference a tough or unique astrological event they face TODAY based on planetary transits.
2. Do NOT give the solution or advice in the notification. Create curiosity and urgency.
3. End with a call-to-action like "Tap to ask the AI how to handle this."
4. If there are NO family members, focus on the user's own chart — mention a career, financial, or personal opportunity they might be missing today.
5. Respond in ${lang} ONLY.
6. Return ONLY a JSON object: { "hook": "the notification text", "subject": "name of the person referenced or 'self'", "subjectDob": "their date of birth or null" }`;

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
          { role: "user", content: "Generate today's cosmic hook notification." },
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
                  hook: { type: "string", description: "The notification text" },
                  subject: { type: "string", description: "Name of the person or 'self'" },
                  subjectDob: { type: "string", description: "Date of birth of the subject, or null" },
                },
                required: ["hook", "subject"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "cosmic_hook" } },
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
    let hookData = { hook: "", subject: "self", subjectDob: null };

    if (toolCall?.function?.arguments) {
      try {
        hookData = JSON.parse(toolCall.function.arguments);
      } catch {
        hookData.hook = toolCall.function.arguments;
      }
    }

    return new Response(JSON.stringify(hookData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("cosmic-hook error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
