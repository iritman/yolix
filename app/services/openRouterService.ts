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

const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  throw new Error(
    "NEXT_PUBLIC_OPENROUTER_API_KEY is not defined in environment variables"
  );
}

export interface CommentAnalysis {
  keywords: {
    word: string;
    relevance: number;
  }[];
  topics: string[];
}

export interface KeywordAnalysis {
  keywords: {
    word: string;
    count: number;
    sentiment: "positive" | "negative" | "neutral";
  }[];
}

export async function analyzeComments(
  comments: string[]
): Promise<CommentAnalysis> {
  try {
    const prompt = `Analyze these comments and provide:
        1. A list of the top 10 most relevant keywords with their relevance scores (1-100), sorted by relevance in descending order
        2. Main topics discussed
        
        Return the result in this exact JSON format:
        {
          "keywords": [
            {
              "word": "keyword",
              "relevance": number between 1-100
            }
          ],
          "topics": ["topic1", "topic2", ...]
        }

        Only include the 10 keywords with highest relevance scores.
        Sort keywords by relevance score from highest to lowest.
        
        Comments:
        ${comments.join("\n")}`;

    const response = await axios.post(
      API_URL,
      createOpenRouterRequest([
        {
          role: "system",
          content:
            "You are a comment analysis expert. Respond only with valid JSON.",
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

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Invalid response from comment analysis API");
    }

    const cleanedContent = extractJsonFromResponse(content);
    const result = parseJsonResponse(cleanedContent);
    return result;
  } catch (error) {
    handleApiError(error);
  }
}

export async function analyzeKeywords(
  comments: string[]
): Promise<KeywordAnalysis> {
  try {
    const prompt = `Analyze these comments and identify the most frequently used keywords.
        For each keyword:
        1. Count its occurrences
        2. Determine its sentiment (positive, negative, or neutral)
        
        Return the result in this exact JSON format:
        {
          "keywords": [
            {
              "word": "keyword",
              "count": number,
              "sentiment": "positive" | "negative" | "neutral"
            }
          ]
        }
        
        Comments:
        ${comments.join("\n")}`;

    const response = await axios.post(
      API_URL,
      createOpenRouterRequest([
        {
          role: "system",
          content:
            "You are a keyword analysis expert. Respond only with valid JSON.",
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

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Invalid response from keyword analysis API");
    }

    const cleanedContent = extractJsonFromResponse(content);
    const result = parseJsonResponse(cleanedContent);
    return result;
  } catch (error) {
    handleApiError(error);
  }
}
