export const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
export const MODEL =
  process.env.NEXT_PUBLIC_OPENROUTER_MODEL ||
  "mistralai/mistral-7b-instruct:free";
export const API_URL = "https://openrouter.ai/api/v1/chat/completions";

if (!OPENROUTER_API_KEY) {
  throw new Error(
    "NEXT_PUBLIC_OPENROUTER_API_KEY is not defined in environment variables"
  );
}

export const getOpenRouterHeaders = () => ({
  Authorization: `Bearer ${OPENROUTER_API_KEY}`,
  "Content-Type": "application/json",
  "HTTP-Referer": "https://youtulix.vercel.app",
  "X-Title": "Youtulix",
});

export const createOpenRouterRequest = (messages: any[]) => ({
  model: MODEL,
  messages,
});
