const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1500;
const PRE_CALL_DELAY_MS = 400; // Delay before each call to avoid burst rate limits

interface GeminiRequestOptions {
  apiKey: string;
  body: Record<string, unknown>;
}

/**
 * Call Gemini API with exponential backoff retry on 429 errors.
 * Includes a pre-call delay to avoid burst rate limiting.
 */
export async function callGeminiWithRetry(
  options: GeminiRequestOptions
): Promise<Response> {
  const { apiKey, body } = options;

  // Force model to gemini-1.5-flash for higher rate limits
  const normalizedBody = { ...body, model: "gemini-2.5-flash-preview-05-20" };

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    // Pre-call delay to space out requests
    if (attempt === 0) {
      await new Promise((r) => setTimeout(r, PRE_CALL_DELAY_MS));
    }

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(normalizedBody),
    });

    if (response.status !== 429 || attempt === MAX_RETRIES) {
      return response;
    }

    // Consume body to prevent resource leak
    await response.text();

    const delay = BASE_DELAY_MS * Math.pow(2, attempt); // 1.5s, 3s, 6s
    console.log(`Gemini 429 rate limit, retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
    await new Promise((r) => setTimeout(r, delay));
  }

  throw new Error("Exhausted retries");
}
