import { TranslationResponse } from "../types";
import translateViaLibre from "./translator";

/**
 * Client-side translation entrypoint. Uses LibreTranslate public instance
 * to perform real translations without requiring API keys.
 */
export const translateAndAnalyzeQuery = async (query: string): Promise<TranslationResponse> => {
  // Directly use the translator (no API keys required)
  return translateViaLibre(query);
};

export default translateAndAnalyzeQuery;
