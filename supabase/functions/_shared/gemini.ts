const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

interface GeminiRequestOptions {
  apiKey: string;
  body: Record<string, unknown>;
}

/**
 * Call Gemini API with exponential backoff retry on 429 errors.
 * Returns the raw Response on success, or throws on exhausted retries.
 */
export async function callGeminiWithRetry(
  options: GeminiRequestOptions
): Promise<Response> {
  const { apiKey, body } = options;

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

    // Consume body to prevent resource leak
    await response.text();

    const delay = BASE_DELAY_MS * Math.pow(2, attempt); // 1s, 2s, 4s
    console.log(`Gemini 429 rate limit, retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
    await new Promise((r) => setTimeout(r, delay));
  }

  // Should never reach here, but TypeScript needs it
  throw new Error("Exhausted retries");
}
