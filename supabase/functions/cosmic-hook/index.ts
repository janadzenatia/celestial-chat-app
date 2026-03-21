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

    const { userName, dateOfBirth, timeOfBirth, familyMembers, language, todaySubject } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("Missing API key");

    const lang = language === "ka" ? "Georgian" : "English";
    const today = new Date().toISOString().split("T")[0];

    const isSelf = todaySubject?.relationship === "self";
    const isPartner = todaySubject?.relationship === "partner";
    const isChild = todaySubject?.relationship === "child";

    let familyContext = "";
    if (familyMembers && familyMembers.length > 0) {
      familyContext = `\n\nThe user has these saved family members:\n${familyMembers.map((m: any) => `- ${m.name} (born ${m.dateOfBirth}, relationship: ${m.relationship})`).join("\n")}`;
    }

    let focusInstruction = "";
    if (isSelf) {
      focusInstruction = `\nTODAY'S FOCUS: Generate the hook about the USER THEMSELVES ("${userName}"). Focus on their personal chart — career, personal growth, self-discovery, health, or a hidden opportunity they might be missing today. Set "subject" to "self".`;
    } else if (isPartner) {
      focusInstruction = `\nTODAY'S FOCUS: Generate the hook about the user's PARTNER "${todaySubject.name}" (born ${todaySubject.dateOfBirth}).
- Focus on relationship dynamics, romantic chemistry, communication energy, or emotional connection happening TODAY.
- Reference how current transits create opportunities for deeper bonding, meaningful conversations, surprise gestures, or resolving old tensions.
- Make the hook feel personal and relationship-focused.
- Set "subject" to "${todaySubject.name}".`;
    } else if (isChild) {
      focusInstruction = `\nTODAY'S FOCUS: Generate the hook about the user's CHILD "${todaySubject.name}" (born ${todaySubject.dateOfBirth}).
- Focus on parenting insights, the child's potential, cosmic gifts the child is receiving today, or a special moment to share.
- Set "subject" to "${todaySubject.name}".`;
    }

    const langInstruction = language === "ka"
      ? `\nLANGUAGE: Respond ONLY in Georgian. Use informal "შენობითი" form — always "შენ/შენი/გაქვს/შეგიძლია", NEVER "თქვენ/თქვენი/გაქვთ/შეგიძლიათ".`
      : `\nLANGUAGE: Respond ONLY in English. Use warm, friendly, personal tone.`;

    const basePrompt = `You are an elite AI astrologer generating a push notification hook. Today is ${today}.

The user's name is "${userName || "Unknown"}". Their birth date is ${dateOfBirth || "Unknown"}, birth time is ${timeOfBirth || "Not provided"}.${familyContext}${focusInstruction}${langInstruction}

TASK: Generate a single highly emotional, intriguing 1-sentence push notification. Rules:
1. Focus ONLY on today's designated subject as specified above.
2. Do NOT give the solution or advice in the notification. Create curiosity and positive urgency — never fear or dread.
3. End with a call-to-action like "${language === "ka" ? "შეეხე და გაიგე მეტი." : "Tap to discover more."}".
4. NEVER predict anything negative, fearful, or fatalistic. Focus on opportunities and cosmic gifts.
5. Return ONLY a JSON object: { "hook": "the notification text", "subject": "name of the person referenced or 'self'", "subjectDob": "their date of birth or null" }`;

    const systemPrompt = buildSystemPrompt(basePrompt, language);

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
      return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), {
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
    return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
