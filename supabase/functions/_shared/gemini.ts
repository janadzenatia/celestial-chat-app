import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1500;
const PRE_CALL_DELAY_MS = 400;

// Default token limits per call type.
// Override by passing max_tokens in the body if a function needs more.
const DEFAULT_MAX_TOKENS = 800;

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

export async function callGeminiWithRetry(options: GeminiRequestOptions): Promise<Response> {
  const { apiKey, body } = options;

  // FIX: use google/gemini-2.5-flash-lite (correct cheaper model) and enforce max_tokens
  const normalizedBody = {
    ...body,
    model: "google/gemini-2.5-flash-lite",
    max_tokens: body.max_tokens ?? DEFAULT_MAX_TOKENS,
  };

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
export function extractTokenUsage(data: any): {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  model: string;
} {
  const usage = data?.usage || {};
  return {
    prompt_tokens: usage.prompt_tokens || 0,
    completion_tokens: usage.completion_tokens || 0,
    total_tokens: usage.total_tokens || 0,
    model: data?.model || "google/gemini-2.5-flash-lite",
  };
}

/**
 * Log token usage to Supabase token_usage table.
 * Fire-and-forget — does not throw on error, but logs all failure details.
 */
export async function logTokenUsage(
  userId: string,
  functionName: string,
  tokenData: { prompt_tokens: number; completion_tokens: number; total_tokens: number; model: string },
): Promise<void> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const payload = {
    user_id: userId,
    function_name: functionName,
    prompt_tokens: tokenData.prompt_tokens,
    completion_tokens: tokenData.completion_tokens,
    total_tokens: tokenData.total_tokens,
    model: tokenData.model,
    created_at: new Date().toISOString(),
  };

  console.log("[tokens] logTokenUsage:start", {
    functionName,
    userId,
    hasSupabaseUrl: Boolean(supabaseUrl),
    hasServiceRoleKey: Boolean(serviceRoleKey),
    payload,
  });

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("[tokens] Missing Supabase admin env vars", {
      functionName,
      userId,
      hasSupabaseUrl: Boolean(supabaseUrl),
      hasServiceRoleKey: Boolean(serviceRoleKey),
    });
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { error } = await supabase.from("token_usage").insert(payload);

    if (error) {
      console.error("[tokens] token_usage insert failed", {
        functionName,
        userId,
        payload,
        error: {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        },
      });
      return;
    }

    console.log("[tokens] token_usage insert succeeded", {
      functionName,
      userId,
      totalTokens: tokenData.total_tokens,
      model: tokenData.model,
    });
  } catch (e) {
    console.error("[tokens] Unexpected error while logging token usage", {
      functionName,
      userId,
      payload,
      error: e instanceof Error ? { name: e.name, message: e.message, stack: e.stack } : String(e),
    });
  }
}
