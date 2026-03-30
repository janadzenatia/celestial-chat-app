const LOVABLE_AI_URL = "https://ai-gateway.lovable.dev/v1/chat/completions";
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

interface GeminiRequestOptions {
  apiKey: string;
  body: Record<string, unknown>;
}

/**
 * Call AI via Lovable AI gateway with exponential backoff retry on 429 errors.
 * Falls back to direct Gemini API if Lovable gateway fails.
 */
export async function callGeminiWithRetry(
  options: GeminiRequestOptions
): Promise<Response> {
  const { apiKey, body } = options;

  // Map model names to Lovable AI gateway format
  const modelMapping: Record<string, string> = {
    "gemini-2.0-flash-lite": "google/gemini-2.5-flash-lite",
    "gemini-1.5-flash": "google/gemini-2.5-flash-lite",
    "gemini-2.5-flash": "google/gemini-2.5-flash",
  };

  const originalModel = body.model as string;
  const lovableModel = modelMapping[originalModel] || "google/gemini-2.5-flash-lite";

  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

  // Use Lovable AI gateway if API key is available
  if (lovableApiKey) {
    const lovableBody = { ...body, model: lovableModel };

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const response = await fetch(LOVABLE_AI_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lovableBody),
      });

      if (response.status !== 429 || attempt === MAX_RETRIES) {
        return response;
      }

      await response.text();
      const delay = BASE_DELAY_MS * Math.pow(2, attempt);
      console.log(`Lovable AI 429, retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  // Fallback to direct Gemini API
  const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (response.status !== 429 || attempt === MAX_RETRIES) {
      return response;
    }

    await response.text();
    const delay = BASE_DELAY_MS * Math.pow(2, attempt);
    console.log(`Gemini 429 rate limit, retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
    await new Promise((r) => setTimeout(r, delay));
  }

  throw new Error("Exhausted retries");
}
