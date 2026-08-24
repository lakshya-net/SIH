/**
 * SERVER-SIDE ONLY helper for calling the Gemini API via native fetch.
 *
 * - Reads GEMINI_API_KEY exclusively from server environment variables.
 * - This module must never be imported from client components ("use client").
 *   Only import it from route handlers (src/app/api/**).
 */

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-3.6-flash";

/** Error thrown when the Gemini API call fails. `status` maps to an HTTP status. */
export class GeminiApiError extends Error {
  status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.name = "GeminiApiError";
    this.status = status;
  }
}

interface GeminiGenerationOptions {
  /** Model id; falls back to GEMINI_MODEL env var, then DEFAULT_MODEL. */
  model?: string;
  /** Content parts (text and/or inline_data for multimodal input). */
  parts: Array<
    | { text: string }
    | { inline_data: { mime_type: string; data: string } }
  >;
  temperature?: number;
  maxOutputTokens?: number;
  /**
   * Optional JSON Schema used with responseMimeType "application/json" to
   * constrain the model to an exact output shape (structured output).
   * See https://ai.google.dev/gemini-api/docs/structured-output
   */
  responseSchema?: Record<string, unknown>;
}

interface GeminiApiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
    finishReason?: string;
  }>;
  promptFeedback?: {
    blockReason?: string;
  };
  error?: {
    message?: string;
    status?: string;
  };
}

/**
 * Calls Gemini generateContent and returns the concatenated model text output.
 * Requests JSON responses via responseMimeType so callers can safely JSON.parse.
 */
export async function generateGeminiContent(
  options: GeminiGenerationOptions
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new GeminiApiError(
      "GEMINI_API_KEY is not configured on the server. Set it in your environment (.env.local) and restart the dev server.",
      500
    );
  }

  const model = options.model ?? process.env.GEMINI_MODEL ?? DEFAULT_MODEL;

  let response: Response;
  try {
    response = await fetch(`${GEMINI_API_BASE}/${model}:generateContent`, {
      method: "POST",
      // Key sent via header (not URL query) so it never appears in logs.
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: options.parts,
          },
        ],
        generationConfig: {
          temperature: options.temperature ?? 0.2,
          maxOutputTokens: options.maxOutputTokens ?? 2048,
          responseMimeType: "application/json",
          // Optional strict schema; without it, JSON mode is valid-syntax-only
          // and the model may not honor the requested shape exactly.
          ...(options.responseSchema
            ? { responseSchema: options.responseSchema }
            : {}),
        },
      }),
    });
  } catch {
    throw new GeminiApiError("Failed to reach the Gemini API (network error).", 502);
  }

  let data: GeminiApiResponse;
  try {
    data = (await response.json()) as GeminiApiResponse;
  } catch {
    throw new GeminiApiError(
      `Gemini API returned a non-JSON response (HTTP ${response.status}).`,
      502
    );
  }

  if (!response.ok) {
    throw new GeminiApiError(
      data?.error?.message ??
        `Gemini API request failed (HTTP ${response.status}${data?.error?.status ? `, ${data.error.status}` : ""}).`,
      response.status === 401 || response.status === 403 ? 500 : 502
    );
  }

  if (data.promptFeedback?.blockReason) {
    throw new GeminiApiError(
      `Gemini blocked the request (${data.promptFeedback.blockReason}).`,
      422
    );
  }

  const text = (data.candidates?.[0]?.content?.parts ?? [])
    .map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    throw new GeminiApiError(
      "Gemini returned an empty response.",
      data.candidates?.[0]?.finishReason === "SAFETY" ? 422 : 502
    );
  }

  return text;
}

/**
 * Safely parses a JSON object out of a model text response.
 * Tolerates accidental markdown code fences around the JSON.
 * Returns null when parsing fails so callers can decide how to degrade.
 */
export function parseModelJson<T>(text: string): T | null {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Last resort: grab the outermost {...} block.
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}
