import { GoogleGenAI, Type } from "@google/genai";
import { TranslationResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const translateAndAnalyzeQuery = async (query: string): Promise<TranslationResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the following customer support query into English and provide a professional suggested response. 
      
      Query: "${query}"`,
      config: {
        systemInstruction: "You are a professional multilingual support agent. Your task is to detect the input language, translate it accurately to English, analyze the sentiment, and draft a helpful, concise English response. Return ONLY valid JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translatedText: {
              type: Type.STRING,
              description: "The English translation of the customer query."
            },
            detectedLanguage: {
              type: Type.STRING,
              description: "The name of the detected source language (e.g., Spanish, Japanese)."
            },
            sentiment: {
              type: Type.STRING,
              description: "One of: positive, neutral, negative."
            },
            suggestedResponse: {
              type: Type.STRING,
              description: "A professional response in English."
            }
          },
          required: ["translatedText", "detectedLanguage", "sentiment", "suggestedResponse"]
        }
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text) as TranslationResponse;
  } catch (error) {
    console.error("Translation failed:", error);
    throw new Error("Failed to process the query. Please try again.");
  }
};
