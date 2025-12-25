import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async (req, res) => {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the following customer support query into English and provide a professional suggested response. 
      
Query: "${query}"`,
      config: {
        systemInstruction:
          "You are a professional multilingual support agent. Your task is to detect the input language, translate it accurately to English, analyze the sentiment, and draft a helpful, concise English response. Return ONLY valid JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translatedText: {
              type: Type.STRING,
              description: "The English translation of the customer query.",
            },
            detectedLanguage: {
              type: Type.STRING,
              description:
                "The name of the detected source language (e.g., Spanish, Japanese).",
            },
            sentiment: {
              type: Type.STRING,
              description: "One of: positive, neutral, negative.",
            },
            suggestedResponse: {
              type: Type.STRING,
              description: "A professional response in English.",
            },
          },
          required: [
            "translatedText",
            "detectedLanguage",
            "sentiment",
            "suggestedResponse",
          ],
        },
      },
    });

    const text = response.text || "{}";
    const result = JSON.parse(text);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Translation failed:", error);
    return res
      .status(500)
      .json({ error: "Failed to process the query. Please try again." });
  }
};
