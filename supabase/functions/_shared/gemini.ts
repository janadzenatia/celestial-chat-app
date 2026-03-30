const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1500;
const PRE_CALL_DELAY_MS = 400;

interface GeminiRequestOptions {
  apiKey: string;
  body: Record<string, unknown>;
}

/**
 * Convert OpenAI-style messages to Gemini native format
 */
function convertToGeminiFormat(body: Record<string, unknown>) {
  const messages = body.messages as Array<{ role: string; content: string }>;
  if (!messages) return { contents: [] };

  const systemInstruction = messages.find(m => m.role === "system");
  const conversationMessages = messages.filter(m => m.role !== "system");

  const contents = conversationMessages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const result: Record<string, unknown> = { contents };
  
  if (systemInstruction) {
    result.systemInstruction = { parts: [{ text: systemInstruction.content }] };
  }

  return result;
}

/**
 * Call Gemini API with exponential backoff retry on 429 errors.
 */
export async function callGeminiWithRetry(
  options: GeminiRequestOptions
): Promise<Response> {
  const { apiKey, body } = options;
  const geminiBody = convertToGeminiFormat(body);
  const url = `${GEMINI_URL}?key=${apiKey}`;
  const isStream = body.stream === true;
  const finalUrl = isStream ? `${url}&alt=sse` : url;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt === 0) {
      await new Promise((r) => setTimeout(r, PRE_CALL_DELAY_MS));
    }

    const response = await fetch(finalUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiBody),
    });

    if (response.status !== 429 || attempt === MAX_RETRIES) {
      // Wrap response to match the OpenAI-style format expected by callers
      if (!isStream && response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const wrapped = {
          choices: [{ message: { content: text } }],
        };
        return new Response(JSON.stringify(wrapped), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return response;
    }

    await response.text();
    const delay = BASE_DELAY_MS * Math.pow(2, attempt);
    console.log(`Gemini 429 rate limit, retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
    await new Promise((r) => setTimeout(r, delay));
  }

  throw new Error("Exhausted retries");
}
