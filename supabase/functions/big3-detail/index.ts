import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildSystemPrompt } from "../_shared/persona.ts";
import { validateAuth } from "../_shared/auth.ts";
import { callGeminiWithRetry, stripMarkdown } from "../_shared/gemini.ts";

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

    const { type, signName, signEmoji, userName, dateOfBirth, timeOfBirth, language } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("Missing API key");

    const lang = language === "ka" ? "Georgian" : "English";

    let typeContext = "";
    if (type === "sun") {
      typeContext = language === "ka"
        ? `მზის ნიშანი განსაზღვრავს შენს ძირითად პიროვნებას, ეგოს, ცხოვრებისეულ მისიას და იმას, თუ ვინ ხარ შენ შიგნით.`
        : `The Sun Sign defines your core personality, ego, life mission, and who you truly are at your center.`;
    } else if (type === "moon") {
      typeContext = language === "ka"
        ? `მთვარის ნიშანი განსაზღვრავს შენს ემოციურ სამყაროს, ინსტინქტებს, შინაგან განცდებს და იმას, თუ რა გჭირდება ემოციური უსაფრთხოებისთვის.`
        : `The Moon Sign defines your emotional world, instincts, inner feelings, and what you need for emotional security.`;
    } else {
      typeContext = language === "ka"
        ? `ასცენდენტი (აღმავალი ნიშანი) არის ის, თუ როგორ გხედავენ შენ სხვები და როგორ წარმოაჩენ თავს პირველი შეხვედრისას. ეს არის შენი სოციალური ნიღაბი და პირველი შთაბეჭდილება.`
        : `The Ascendant (Rising Sign) is how others see you and how you present yourself at first meetings. It's your social mask and first impression.`;
    }

    const typeLabel = type === "sun" ? "Sun Sign" : type === "moon" ? "Moon Sign" : "Ascendant/Rising Sign";

    const prompt = `Generate a detailed, personalized explanation of ${userName}'s ${typeLabel}.

Their birth date is ${dateOfBirth}, birth time is ${timeOfBirth || "unknown"}.
Their ${typeLabel} is: ${signName} ${signEmoji}

Context about what this placement means:
${typeContext}

Please provide:
1. A brief opening (1-2 sentences) explaining what this type of sign represents in astrology
2. A section titled "${language === "ka" ? `რას ნიშნავს ${signName}?` : `What does ${signName} mean?`}" with 4-5 key personality traits. Each trait should have the trait name followed by a brief explanation.
3. A personalized closing insight (1-2 sentences) connecting this placement to ${userName}'s unique energy

Do NOT use any markdown formatting — no asterisks, no bold, no italic, no headers, no bullet markers. Plain text only. Use line breaks to separate traits.
Respond ONLY in ${lang}.`;

    const systemPrompt = buildSystemPrompt(
      "You provide detailed, educational astrological sign explanations. Be warm, insightful, and empowering.",
      language
    );

    const response = await callGeminiWithRetry({
      apiKey: GEMINI_API_KEY,
      body: {
        model: "gemini-2.0-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
      },
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

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("big3-detail error:", e);
    return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});