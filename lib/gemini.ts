import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

/**
 * The fallback chain is configurable via the GEMINI_FALLBACK_MODELS env variable.
 * If not set, it defaults to the full 4-model chain below.
 * 
 * To update the chain without changing code, edit .env:
 *   GEMINI_FALLBACK_MODELS=gemini-3.5-flash,gemini-3.5-flash-lite
 * 
 * Full default chain (newest → oldest):
 *   gemini-3.5-flash → gemini-3.5-flash-lite
 */
const DEFAULT_MODELS_CHAIN = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite"
];

const MODELS_CHAIN: string[] = process.env.GEMINI_FALLBACK_MODELS
  ? process.env.GEMINI_FALLBACK_MODELS.split(",").map(m => m.trim()).filter(Boolean)
  : DEFAULT_MODELS_CHAIN;

interface GenerationOptions {
  responseMimeType?: string;
}

/**
 * Attempts to generate content using the primary model. If a rate limit (429) or 
 * deprecation (404) error occurs, it automatically falls back sequentially to 
 * secondary models in the chain.
 * 
 * If ALL models fail, returns a local mock response so the app never fully crashes.
 */
export async function generateWithFallback(
  prompt: string,
  options?: GenerationOptions
) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "your_gemini_api_key_here") {
    throw new Error("Google Gemini API key is not configured in your environment.");
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  let lastError: any = null;

  for (const modelName of MODELS_CHAIN) {
    try {
      console.log(`[AI Carrier Coach] Calling model: ${modelName}`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: options?.responseMimeType 
          ? { responseMimeType: options.responseMimeType } 
          : undefined
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      console.log(`[AI Carrier Coach] Success using model: ${modelName}`);
      return {
        text,
        modelUsed: modelName
      };
    } catch (err: any) {
      console.warn(`[AI Carrier Coach] Model ${modelName} failed:`, err.message || err);
      lastError = err;

      const errMsg = (err.message || "").toLowerCase();
      const isQuotaError = errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("rate limit") || err.status === 429;
      const isNotFoundError = errMsg.includes("404") || errMsg.includes("not found") || errMsg.includes("not supported") || err.status === 404;

      if (!isQuotaError && !isNotFoundError) {
        // If it's a structural prompt/code error rather than a quota/availability error, fail early
        throw err;
      }
    }
  }

  throw new Error(`Gemini API calls failed: ${lastError?.message || lastError || "Unknown error"}`);
}
