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

export interface Keyword {
  word: string;
  relevance: number;
}

export interface Topic {
  topic: string;
  relevance: number;
  commentCount: number;
  keywords: string[];
}

export interface CombinedAnalysis {
  keywords: Keyword[];
  topics: Topic[];
}

export async function analyzeComments(
  comments: string[]
): Promise<CombinedAnalysis> {
  try {
    const prompt = `Analyze these comments and provide:
        1. A list of keywords with their relevance scores (1-100)
        2. A list of main topics discussed (max 5 topics)
           For each topic:
           - Calculate its relevance (1-100)
           - Count how many comments mention it
           - List 3-5 key terms associated with it
        
        Return the result in this exact JSON format:
        {
          "keywords": [
            {
              "word": "keyword",
              "relevance": number between 1-100
            }
          ],
          "topics": [
            {
              "topic": "topic name",
              "relevance": number between 1-100,
              "commentCount": number of comments mentioning this topic,
              "keywords": ["keyword1", "keyword2", "keyword3"]
            }
          ]
        }
        
        Ensure that the JSON is valid and does not contain any invalid characters, duplicate fields, or other formatting issues.
        
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
      throw new Error("Invalid response from analysis API");
    }

    const cleanedContent = extractJsonFromResponse(content);
    const result = parseJsonResponse(cleanedContent);
    return result;
  } catch (error) {
    handleApiError(error);
  }
}
