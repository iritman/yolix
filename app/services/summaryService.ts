import axios from "axios";
import {
  API_URL,
  getOpenRouterHeaders,
  createOpenRouterRequest,
} from "./openRouterConfig";
import {
  extractJsonFromResponse,
  parseJsonResponse,
  handleApiError,
} from "../utils/utils";

export interface Summary {
  detectedLanguage: string;
  english: string;
  translated: string;
}

export async function generateSummary(comments: string[]): Promise<Summary> {
  try {
    const prompt = `Analyze these comments and:
        1. Determine the predominant language of the comments
        2. Generate a concise summary in English focusing on main themes, sentiments, and key points
        3. Translate the English summary to the predominant language

        Return ONLY a raw JSON object starting with { and ending with }, with no code block markers or other text.
        The JSON must follow this exact format:
        {
          "detectedLanguage": "language name in English (e.g. English, Spanish, Persian)", 
          "english": "the English summary",
          "translated": "summary translated to the predominant language"
        }

        Comments:
        ${comments.join("\n")}`;

    const response = await axios.post(
      API_URL,
      createOpenRouterRequest([
        {
          role: "system",
          content:
            "You are a multilingual comment analysis expert. Respond only with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ]),
      {
        headers: getOpenRouterHeaders(),
      }
    );

    if (response.data?.error?.code === 429) {
      throw new Error("Rate limit exceeded: Please try again later");
    }

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error("Invalid response from summary API");
    }

    const content = extractJsonFromResponse(
      response.data.choices[0].message.content
    );
    const result = parseJsonResponse(content);
    return result;
  } catch (error) {
    handleApiError(error);
  }
}
