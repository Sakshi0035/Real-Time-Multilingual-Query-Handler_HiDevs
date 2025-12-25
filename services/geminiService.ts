import { TranslationResponse } from "../types";

/**
 * Call the backend API proxy that holds the secret key.
 * The backend forwards requests to Gemini API.
 * This keeps the API key server-side and out of the browser.
 */
export const translateAndAnalyzeQuery = async (query: string): Promise<TranslationResponse> => {
  try {
    const response = await fetch("/.netlify/functions/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    return result as TranslationResponse;
  } catch (error) {
    console.error("Translation failed:", error);
    throw new Error("Failed to process the query. Please try again.");
  }
};
