export function extractJsonFromResponse(content: string): string {
  return content.trim().replace("```json", "").replace("```", "");
}

export function parseJsonResponse(content: string): any {
  try {
    const result = JSON.parse(content);
    console.log("Parsed result:", result);
    return result;
  } catch (parseError) {
    console.error("Failed to parse JSON:", content);
    throw new Error("Invalid JSON in API response");
  }
}

export function handleApiError(error: any): never {
  console.error("API Error:", error);
  if (error.response?.data?.error?.message) {
    throw new Error(`API Error: ${error.response.data.error.message}`);
  }
  throw new Error(error.message || "An error occurred");
}
