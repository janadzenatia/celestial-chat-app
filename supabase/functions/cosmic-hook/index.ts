import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildSystemPrompt } from "../_shared/persona.ts";

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
    if (!LOVABLE_API_KEY) throw new Error("Missing API key");

    const lang = language === "ka" ? "Georgian" : "English";
    const today = new Date().toISOString().split("T")[0];

    const children = (familyMembers || []).filter((m: any) => m.relationship === "child");
    const partners = (familyMembers || []).filter((m: any) => m.relationship === "partner");
    const hasChildren = children.length > 0;
    const hasPartner = partners.length > 0;

    let familyContext = "";
    if (familyMembers && familyMembers.length > 0) {
      familyContext = `\n\nThe user has these saved family members:\n${familyMembers.map((m: any) => `- ${m.name} (born ${m.dateOfBirth}, relationship: ${m.relationship})`).join("\n")}`;
    }

    let selectionRule = "";
    if (hasPartner && hasChildren) {
      selectionRule = `\nIMPORTANT SELECTION RULE: You MUST naturally alternate between family members. Use today's date as a seed — if the day of the month is even, pick the PARTNER. If odd, pick a CHILD. This ensures variety across days.`;
    } else if (hasPartner) {
      selectionRule = `\nThe user has a partner saved. Focus on the PARTNER's astrological dynamics and relationship energy today.`;
    }

    let partnerGuidance = "";
    if (hasPartner) {
      const p = partners[0];
      partnerGuidance = `\n\nPARTNER-SPECIFIC GUIDANCE (use when selecting the partner "${p.name}"):
- Focus on relationship dynamics, romantic chemistry, communication energy, or emotional connection happening TODAY based on planetary transits affecting both charts.
- Reference how current transits create opportunities for deeper bonding, meaningful conversations, surprise gestures, or resolving old tensions.
- Examples of good partner hooks: "Venus is activating ${p.name}'s love sector today — a small gesture could spark something beautiful", "Mercury's transit is opening a rare communication window between you and ${p.name}"
- Make the hook feel personal and relationship-focused, not generic.`;
    }

    const basePrompt = `You are an elite AI astrologer generating a push notification hook. Today is ${today}.

The user's name is "${userName || "Unknown"}". Their birth date is ${dateOfBirth || "Unknown"}, birth time is ${timeOfBirth || "Not provided"}.${familyContext}${selectionRule}${partnerGuidance}

TASK: Generate a single highly emotional, intriguing 1-sentence push notification. Rules:
1. If there are family members, pick ONE specific family member by name and reference a unique astrological event they face TODAY based on planetary transits.
2. When the selected member is the PARTNER, focus on relationship dynamics, romantic energy, or emotional connection between the user and their partner.
3. When the selected member is a CHILD, focus on parenting insights, the child's potential, or cosmic gifts the child is receiving today.
4. Do NOT give the solution or advice in the notification. Create curiosity and positive urgency — never fear or dread.
5. End with a call-to-action like "Tap to discover more."
6. If there are NO family members, focus on the user's own chart — mention a career, personal growth, or relationship opportunity they might be missing today.
7. NEVER predict anything negative, fearful, or fatalistic. Focus on opportunities and cosmic gifts.
8. Respond in ${lang} ONLY.
9. Return ONLY a JSON object: { "hook": "the notification text", "subject": "name of the person referenced or 'self'", "subjectDob": "their date of birth or null" }`;

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
