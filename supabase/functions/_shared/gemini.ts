import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1500;
const PRE_CALL_DELAY_MS = 400;

interface GeminiRequestOptions {
  apiKey: string;
  body: Record<string, unknown>;
}

export function stripMarkdown(text: string): string {
  if (!text) return text;
  return text
    .replace(/#{1,6}\s*/g, "")
    .replace(/\*\*\*(.*?)\*\*\*/g, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/`{1,3}(.*?)`{1,3}/gs, "$1")
    .replace(/^[-*+]\s/gm, "• ")
    .trim();
}

export function stripMarkdownDeep(obj: any): any {
  if (typeof obj === "string") return stripMarkdown(obj);
  if (Array.isArray(obj)) return obj.map(stripMarkdownDeep);
  if (obj && typeof obj === "object") {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = stripMarkdownDeep(value);
    }
    return result;
  }
  return obj;
}

export async function callGeminiWithRetry(
  options: GeminiRequestOptions
): Promise<Response> {
  const { apiKey, body } = options;
  const normalizedBody = { ...body, model: "gemini-2.5-flash" };

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
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

    await response.text();
    const delay = BASE_DELAY_MS * Math.pow(2, attempt);
    console.log(`Gemini 429 rate limit, retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
    await new Promise((r) => setTimeout(r, delay));
  }

  throw new Error("Exhausted retries");
}

/**
 * Extract token usage from a Gemini API response JSON.
 * Call this AFTER parsing the response JSON (data = await response.json()).
 */
export function extractTokenUsage(data: any): { prompt_tokens: number; completion_tokens: number; total_tokens: number; model: string } {
  const usage = data?.usage || {};
  return {
    prompt_tokens: usage.prompt_tokens || 0,
    completion_tokens: usage.completion_tokens || 0,
    total_tokens: usage.total_tokens || 0,
    model: data?.model || "gemini-2.5-flash",
  };
}

/**
 * Log token usage to Supabase token_usage table.
 * Fire-and-forget — does not throw on error.
 */
export async function logTokenUsage(
  userId: string,
  functionName: string,
  tokenData: { prompt_tokens: number; completion_tokens: number; total_tokens: number; model: string }
): Promise<void> {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await supabase.from("token_usage").insert({
      user_id: userId,
      function_name: functionName,
      prompt_tokens: tokenData.prompt_tokens,
      completion_tokens: tokenData.completion_tokens,
      total_tokens: tokenData.total_tokens,
      model: tokenData.model,
    });

    console.log(`[tokens] ${functionName}: prompt=${tokenData.prompt_tokens} completion=${tokenData.completion_tokens} total=${tokenData.total_tokens}`);
  } catch (e) {
    console.error("Failed to log token usage:", e);
  }
}
