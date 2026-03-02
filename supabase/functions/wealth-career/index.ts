import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { dateOfBirth, timeOfBirth, name, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const lang = language === "ka" ? "Georgian" : "English";
    const today = new Date().toISOString().split("T")[0];

    const birthYear = new Date(dateOfBirth).getFullYear();
    const currentAge = new Date().getFullYear() - birthYear;

    const systemPrompt = `You are an elite Vocational Astrologer and Financial Destiny analyst. Today is ${today}. The user is named ${name || "User"}, born on ${dateOfBirth}${timeOfBirth ? ` at ${timeOfBirth}` : ""}, currently approximately ${currentAge} years old.

You must estimate the 2nd House (wealth), 10th House (Midheaven/career), and Jupiter/Saturn cycles to generate a deep, realistic, lifelong analysis.

Respond ONLY with a valid JSON object (no markdown, no code fences) with exactly these 3 keys:

{
  "cosmic_calling": "A detailed section about 3 highly specific, modern career paths where this person has the absolute highest chance of success and fulfillment. Include why each career aligns with their chart.",
  "wealth_dna": "A realistic assessment of their financial potential. What is their money-making superpower? At what specific age or age range are they most likely to hit their ultimate financial peak? Be specific and encouraging but honest.",
  "career_timeline": "A macro-timeline of their ENTIRE life with 5-7 distinct periods (e.g. 'Ages 22-28: The Foundation', 'Ages 30-35: The Breakthrough', 'Ages 40-45: The Saturnian Challenge'). Each period should have a title and 2-3 sentences describing growth opportunities and challenges. Make it personalized to their birth data."
}

Rules:
- Respond ENTIRELY in ${lang}.
- Be deeply personalized, empathetic, professional, and encouraging.
- Use astrological terminology naturally but keep it accessible.
- The career_timeline must cover from early 20s through retirement age.
- Do NOT wrap in markdown code blocks. Return raw JSON only.`;

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
          { role: "user", content: `Generate my Wealth & Career Destiny report.` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI service error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) throw new Error("No content in AI response");

    // Parse JSON, handling potential markdown wrapping
    let parsed;
    try {
      const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error("Failed to parse AI response as JSON");
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("wealth-career error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
